import Papa from "papaparse";

export interface ParsedCSVData {
  data: Record<string, any>[];
  headers: string[];
  rowCount: number;
}

export function parseCSV(file: File): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve({
          data: results.data as Record<string, any>[],
          headers: results.meta.fields || [],
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function detectSchemaType(headers: string[]): string {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  // Inventory detection
  if (
    lowerHeaders.includes("vin") ||
    lowerHeaders.includes("vehicle-identifiers__value") ||
    lowerHeaders.includes("vin-row")
  ) {
    return "inventory_vehicle";
  }

  // SpyFu detection
  if (
    lowerHeaders.includes("domain name") &&
    lowerHeaders.includes("overlap") &&
    lowerHeaders.includes("common keywords")
  ) {
    return "spyfu_competitors";
  }

  if (lowerHeaders.includes("backlink") && lowerHeaders.includes("domain strength")) {
    return "spyfu_backlinks";
  }

  if (lowerHeaders.includes("startrank") && lowerHeaders.includes("endrank")) {
    return "spyfu_ranking_history";
  }

  if (
    (lowerHeaders.includes("is question?") || lowerHeaders.includes("is question")) &&
    lowerHeaders.includes("total monthly clicks")
  ) {
    return "spyfu_seo_kombat";
  }

  if (
    lowerHeaders.includes("top ranked url") &&
    lowerHeaders.includes("ranking difficulty")
  ) {
    return "spyfu_seo_keywords";
  }

  // Geo Sales
  if (
    lowerHeaders.includes("zip") &&
    lowerHeaders.some((h) => h.includes("radius") || h.includes("distance"))
  ) {
    return "geo_sales";
  }

  // Ads Daily
  if (lowerHeaders.some((h) => h.includes("campaign_id"))) {
    return "ads_daily";
  }

  // Campaign Summary
  if (
    lowerHeaders.includes("device") &&
    lowerHeaders.some((h) => h.includes("network"))
  ) {
    return "campaign_summary";
  }

  // Sales Total
  if (lowerHeaders.includes("brand") && lowerHeaders.includes("units sold")) {
    return "sales_total";
  }

  // Google Search Terms
  if (
    lowerHeaders.includes("search term") &&
    (lowerHeaders.includes("added/excluded") || lowerHeaders.includes("match type"))
  ) {
    return "google_search_terms";
  }

  return "unknown";
}
