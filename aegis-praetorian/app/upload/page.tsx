"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseCSV, detectSchemaType } from "@/lib/csv-parser";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    insertedCount?: number;
  } | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    rowCount: number;
    schemaType: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    try {
      const parsed = await parseCSV(selectedFile);
      const schemaType = detectSchemaType(parsed.headers);

      setPreview({
        headers: parsed.headers,
        rowCount: parsed.rowCount,
        schemaType,
      });
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setResult({
        success: false,
        message: "Failed to parse CSV file",
      });
    }
  };

  const handleUpload = async () => {
    if (!file || !preview) return;

    setUploading(true);
    setResult(null);

    try {
      const parsed = await parseCSV(file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: parsed.data,
          schemaType: preview.schemaType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          insertedCount: data.insertedCount,
        });
        setFile(null);
        setPreview(null);
      } else {
        setResult({
          success: false,
          message: data.error || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setResult({
        success: false,
        message: "Failed to upload data",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">
          Import CSV files to populate the inventory database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV File Upload</CardTitle>
          <CardDescription>
            Upload inventory, sales, or marketing data in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label
              htmlFor="csv-file"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select CSV File
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {preview && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h3 className="font-semibold">File Preview</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Detected Schema:</span>{" "}
                  <span className="font-medium">{preview.schemaType}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Rows:</span>{" "}
                  <span className="font-medium">{preview.rowCount}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Columns:</span>{" "}
                  <span className="font-medium">{preview.headers.length}</span>
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Headers:</p>
                <div className="flex flex-wrap gap-1">
                  {preview.headers.slice(0, 10).map((header, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {header}
                    </span>
                  ))}
                  {preview.headers.length > 10 && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      +{preview.headers.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`rounded-lg border p-4 ${
                result.success
                  ? "bg-green-500/10 border-green-500/50 text-green-500"
                  : "bg-red-500/10 border-red-500/50 text-red-500"
              }`}
            >
              <p className="font-medium">{result.message}</p>
              {result.insertedCount !== undefined && (
                <p className="text-sm mt-1">
                  {result.insertedCount} records processed
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading || preview?.schemaType === "unknown"}
            >
              {uploading ? "Uploading..." : "Upload Data"}
            </Button>
            {file && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {preview?.schemaType === "unknown" && (
            <p className="text-sm text-yellow-500">
              Warning: Could not detect schema type. Please ensure your CSV
              matches one of the supported formats.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Data Types</CardTitle>
          <CardDescription>
            The following CSV formats are automatically detected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Inventory Vehicles:</strong> VIN, Make, Model, Price, Dealer
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Geographic Sales:</strong> ZIP, Radius, Sales Data
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Ads Daily:</strong> Campaign, Impressions, Clicks, Cost
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>SpyFu Data:</strong> Competitors, Keywords, Backlinks
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Sales Total:</strong> Brand, Model, Units Sold
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
