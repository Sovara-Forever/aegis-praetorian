# XANO FUNCTIONS - Data Normalization Pipeline

## FUNCTION 1: detect_dealer_schema
**Purpose**: Identify which scrape pattern the incoming JSON uses

**Input Parameters:**
- `raw_record` (object): Single vehicle JSON object from scraper

**Return Type:** text

**Function Code:**
```javascript
// Input: raw_record (object)
// Output: "DealerInspire_A" | "DealerInspire_B" | "CDK" | "unknown"

const keys = Object.keys(raw_record);

// Pattern A: Midstate Chevy / DealerInspire variant 1
if (keys.includes("vehicle-title--year") &&
    keys.includes("vehicle-identifiers--value") &&
    keys.includes("vehicle-pricing-highlight-amount_2")) {
  return "DealerInspire_A";
}

// Pattern B: Cherry Hill VW / DealerInspire variant 2
if (keys.includes("title-top") &&
    keys.includes("vin-row") &&
    keys.includes("stock-row") &&
    keys.includes("price")) {
  return "DealerInspire_B";
}

// CDK pattern (for future expansion)
if (keys.includes("STOCKNUMBER") &&
    keys.includes("VIN") &&
    keys.includes("INTERNETPRICE")) {
  return "CDK";
}

// Unknown schema - log for manual review
return "unknown";
```

**Usage in Xano:**
1. Create as "Custom Function" in Xano
2. Call from API endpoint before normalization loop
3. Cache result for batch processing

---

## FUNCTION 2: normalize_vehicle_data
**Purpose**: Transform raw scraped JSON into standardized vehicle object

**Input Parameters:**
- `schema_type` (text): Output from detect_dealer_schema
- `raw_data` (object): Single vehicle JSON from scraper
- `client_id` (integer): Owner client ID
- `dealer_name` (text): Source dealer name
- `dealer_website` (text): Source URL
- `source_type` (text): "owned" or "competitor"

**Return Type:** object

**Function Code:**
```javascript
// Initialize normalized object with common fields
let normalized = {
  client_id: client_id,
  source_type: source_type,
  dealer_name: dealer_name,
  dealer_website: dealer_website,
  first_seen_at: new Date().toISOString(),
  last_seen_at: new Date().toISOString(),
  condition: "new" // default
};

// ============================================================
// PATTERN A: DealerInspire Midstate Chevy Style
// ============================================================
if (schema_type === "DealerInspire_A") {

  // Basic vehicle info
  normalized.year = parseInt(raw_data["vehicle-title--year"] || "0");

  // Split make/model (e.g., "Chevrolet Silverado 1500")
  const makeModel = raw_data["vehicle-title--make-model"] || "";
  const parts = makeModel.split(" ");
  normalized.make = parts[0] || null;
  normalized.model = parts.slice(1).join(" ") || null;

  normalized.trim = raw_data["vehicle-title--trim"] || null;
  normalized.condition = (raw_data["vehicle-title--condition"] || "new").toLowerCase();

  // Identifiers
  normalized.vin = raw_data["vehicle-identifiers--value"] || null;
  normalized.stock_number = raw_data["vehicle-identifiers--value_2"] || null;

  // Pricing (clean currency formatting)
  const msrp_raw = raw_data["vehicle-pricing-highlight-amount_2"] || "0";
  const price_raw = raw_data["vehicle-pricing-highlight-amount"] || "0";

  normalized.msrp = parseFloat(msrp_raw.replace(/[$,]/g, "")) || null;
  normalized.dealer_price = parseFloat(price_raw.replace(/[$,]/g, "")) || null;

  // Mileage
  const mileage_raw = raw_data["vehicle-specifications--item"] || "0";
  normalized.mileage = parseInt(mileage_raw.replace(/[,\s]/g, "")) || 0;

  // Colors
  normalized.exterior_color = raw_data["vehicle-specifications--item_2"] || null;
  normalized.interior_color = raw_data["vehicle-specifications--item_3"] || null;

  // Images
  normalized.image_url_primary = raw_data["vehicle-card-link"] || null;
  normalized.url_detail_page = raw_data["vehicle-card-link"] || null;

  // Body style (extract from model if possible)
  const model_lower = (normalized.model || "").toLowerCase();
  if (model_lower.includes("sedan")) normalized.body_style = "sedan";
  else if (model_lower.includes("suv")) normalized.body_style = "suv";
  else if (model_lower.includes("truck") || model_lower.includes("silverado") || model_lower.includes("colorado")) normalized.body_style = "truck";
  else normalized.body_style = null;
}

// ============================================================
// PATTERN B: DealerInspire Cherry Hill VW Style
// ============================================================
else if (schema_type === "DealerInspire_B") {

  // Parse title (e.g., "New 2026")
  const titleTop = raw_data["title-top"] || "";
  const titleParts = titleTop.split(" ");
  normalized.condition = (titleParts[0] || "new").toLowerCase();
  normalized.year = parseInt(titleParts[1] || "0");

  // Parse make/model (e.g., "Volkswagen Jetta S")
  const titleBottom = raw_data["title-bottom"] || "";
  const modelParts = titleBottom.split(" ");
  normalized.make = modelParts[0] || null;
  normalized.model = modelParts.slice(1, -1).join(" ") || null;
  normalized.trim = modelParts[modelParts.length - 1] || null;

  // Identifiers (clean prefix text)
  normalized.vin = (raw_data["vin-row"] || "").replace("VIN: ", "").trim();
  normalized.stock_number = (raw_data["stock-row"] || "").replace("Stock: ", "").trim();

  // Pricing
  const msrp_raw = raw_data["price"] || "0";
  const dealer_raw = raw_data["strong_2"] || "0";

  normalized.msrp = parseFloat(msrp_raw.replace(/[$,]/g, "")) || null;
  normalized.dealer_price = parseFloat(dealer_raw.replace(/[$,]/g, "")) || null;

  // Images
  normalized.image_url_primary = raw_data["hit-link"] || null;
  normalized.url_detail_page = raw_data["_container_link"] || null;

  // Special: Parse incentives into JSON array
  let incentives = [];
  for (let i = 3; i <= 8; i++) {
    const label_key = `price-label_${i}`;
    const price_key = `price_${i}`;

    if (raw_data[label_key] && raw_data[price_key]) {
      incentives.push({
        program_name: raw_data[label_key],
        value: raw_data[price_key]
      });
    }
  }

  if (incentives.length > 0) {
    normalized.incentives_json = incentives;
  }

  // Check for special offers
  if (raw_data["hit-special"]) {
    normalized.has_special_offer = true;
  }

  // Body style inference
  const model_lower = (normalized.model || "").toLowerCase();
  if (model_lower.includes("jetta") || model_lower.includes("passat")) normalized.body_style = "sedan";
  else if (model_lower.includes("taos") || model_lower.includes("tiguan") || model_lower.includes("atlas")) normalized.body_style = "suv";
  else normalized.body_style = null;
}

// ============================================================
// CALCULATED FIELDS (All Schema Types)
// ============================================================

// Discount calculations
if (normalized.msrp && normalized.dealer_price && normalized.msrp > 0) {
  normalized.discount_amount = normalized.msrp - normalized.dealer_price;
  normalized.discount_percent = parseFloat(
    ((normalized.discount_amount / normalized.msrp) * 100).toFixed(2)
  );
}

// Condition normalization
if (normalized.condition) {
  normalized.condition = normalized.condition.toLowerCase();
  if (!["new", "used", "certified"].includes(normalized.condition)) {
    normalized.condition = "new"; // default
  }
}

// VIN validation (basic check)
if (normalized.vin && normalized.vin.length !== 17) {
  // Invalid VIN length - flag for review
  normalized.vin = null;
}

return normalized;
```

**Usage in Xano:**
1. Call within loop after detect_dealer_schema
2. Output feeds directly into upsert_vehicle function
3. Log any null VIN results for manual review

---

## FUNCTION 3: upsert_vehicle
**Purpose**: Insert new vehicle or update existing by VIN

**Input Parameters:**
- `normalized_vehicle` (object): Output from normalize_vehicle_data

**Return Type:** text ("inserted" | "updated" | "error")

**Function Code:**
```javascript
// Check if VIN is valid
if (!normalized_vehicle.vin || normalized_vehicle.vin.length < 17) {
  return "error";
}

// Query existing vehicle by VIN
const existing = query(
  "SELECT id, dealer_price, first_seen_at FROM vehicles WHERE vin = ?",
  [normalized_vehicle.vin]
);

// CASE 1: Vehicle exists - UPDATE
if (existing && existing.length > 0) {
  const vehicle_id = existing[0].id;
  const old_price = existing[0].dealer_price;

  // Update all fields except first_seen_at
  query(
    `UPDATE vehicles SET
      dealer_name = ?,
      dealer_website = ?,
      year = ?,
      make = ?,
      model = ?,
      trim = ?,
      stock_number = ?,
      msrp = ?,
      dealer_price = ?,
      discount_amount = ?,
      discount_percent = ?,
      mileage = ?,
      condition = ?,
      exterior_color = ?,
      interior_color = ?,
      body_style = ?,
      image_url_primary = ?,
      incentives_json = ?,
      url_detail_page = ?,
      last_seen_at = NOW(),
      updated_at = NOW()
    WHERE id = ?`,
    [
      normalized_vehicle.dealer_name,
      normalized_vehicle.dealer_website,
      normalized_vehicle.year,
      normalized_vehicle.make,
      normalized_vehicle.model,
      normalized_vehicle.trim,
      normalized_vehicle.stock_number,
      normalized_vehicle.msrp,
      normalized_vehicle.dealer_price,
      normalized_vehicle.discount_amount,
      normalized_vehicle.discount_percent,
      normalized_vehicle.mileage,
      normalized_vehicle.condition,
      normalized_vehicle.exterior_color,
      normalized_vehicle.interior_color,
      normalized_vehicle.body_style,
      normalized_vehicle.image_url_primary,
      JSON.stringify(normalized_vehicle.incentives_json || []),
      normalized_vehicle.url_detail_page,
      vehicle_id
    ]
  );

  // BONUS: If price changed, create price alert
  if (old_price && normalized_vehicle.dealer_price &&
      Math.abs(old_price - normalized_vehicle.dealer_price) > 500) {

    const price_change = normalized_vehicle.dealer_price - old_price;
    const change_type = price_change > 0 ? "increased" : "decreased";

    query(
      `INSERT INTO market_insights
        (client_id, insight_type, title, description, priority, category, is_read, created_at)
       VALUES (?, 'pricing_alert', ?, ?, 'medium', 'pricing', false, NOW())`,
      [
        normalized_vehicle.client_id,
        `Price ${change_type} on ${normalized_vehicle.year} ${normalized_vehicle.make} ${normalized_vehicle.model}`,
        `${normalized_vehicle.dealer_name} changed price from $${old_price} to $${normalized_vehicle.dealer_price} (${change_type} $${Math.abs(price_change)})`
      ]
    );
  }

  return "updated";
}

// CASE 2: New vehicle - INSERT
else {
  query(
    `INSERT INTO vehicles (
      client_id, source_type, dealer_name, dealer_website,
      year, make, model, trim, vin, stock_number,
      msrp, dealer_price, discount_amount, discount_percent,
      mileage, condition, exterior_color, interior_color,
      body_style, image_url_primary, incentives_json,
      url_detail_page, first_seen_at, last_seen_at,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())`,
    [
      normalized_vehicle.client_id,
      normalized_vehicle.source_type,
      normalized_vehicle.dealer_name,
      normalized_vehicle.dealer_website,
      normalized_vehicle.year,
      normalized_vehicle.make,
      normalized_vehicle.model,
      normalized_vehicle.trim,
      normalized_vehicle.vin,
      normalized_vehicle.stock_number,
      normalized_vehicle.msrp,
      normalized_vehicle.dealer_price,
      normalized_vehicle.discount_amount,
      normalized_vehicle.discount_percent,
      normalized_vehicle.mileage,
      normalized_vehicle.condition,
      normalized_vehicle.exterior_color,
      normalized_vehicle.interior_color,
      normalized_vehicle.body_style,
      normalized_vehicle.image_url_primary,
      JSON.stringify(normalized_vehicle.incentives_json || []),
      normalized_vehicle.url_detail_page
    ]
  );

  return "inserted";
}
```

**Usage:**
- Called for each normalized vehicle
- Automatically tracks price changes
- Creates market_insights when significant price shifts detected

---

## FUNCTION 4: calculate_days_on_lot
**Purpose**: Compute how long a vehicle has been in inventory

**Input Parameters:**
- `first_seen_at` (timestamp): When vehicle first scraped

**Return Type:** integer

**Function Code:**
```javascript
const first_seen = new Date(first_seen_at);
const now = new Date();

const diff_ms = now - first_seen;
const days = Math.floor(diff_ms / (1000 * 60 * 60 * 24));

return days;
```

**Usage:**
- Add as computed field in Xano vehicles table
- Triggers automatically on SELECT queries
- Index DESC for "aging inventory" alerts

---

## FUNCTION 5: generate_inventory_gaps
**Purpose**: AI-driven competitive gap analysis (called by Claude Actions)

**Input Parameters:**
- `client_id` (integer): Target client

**Return Type:** array of objects

**Function Code:**
```javascript
// Get client's owned inventory summary
const owned_inventory = query(
  `SELECT make, model, COUNT(*) as count, AVG(dealer_price) as avg_price
   FROM vehicles
   WHERE client_id = ? AND source_type = 'owned' AND deleted_at IS NULL
   GROUP BY make, model`,
  [client_id]
);

// Get competitor inventory in same market
const competitor_inventory = query(
  `SELECT make, model, COUNT(*) as count, AVG(dealer_price) as avg_price
   FROM vehicles
   WHERE client_id = ? AND source_type = 'competitor' AND deleted_at IS NULL
   GROUP BY make, model
   HAVING count > 3`,
  [client_id]
);

// Find gaps: models competitors have but client doesn't
let gaps = [];

competitor_inventory.forEach(comp => {
  const has_model = owned_inventory.find(
    own => own.make === comp.make && own.model === comp.model
  );

  if (!has_model) {
    gaps.push({
      make: comp.make,
      model: comp.model,
      competitor_count: comp.count,
      competitor_avg_price: comp.avg_price,
      gap_type: "missing_model",
      priority_score: comp.count > 10 ? 9 : 6
    });
  } else if (has_model.count < comp.count * 0.5) {
    gaps.push({
      make: comp.make,
      model: comp.model,
      client_count: has_model.count,
      competitor_count: comp.count,
      gap_type: "understock",
      priority_score: 7
    });
  }
});

// Sort by priority
gaps.sort((a, b) => b.priority_score - a.priority_score);

return gaps;
```

**Usage:**
- Triggered by Zapier after scrape completes
- Feeds into Claude Actions AI prompt
- Results saved to market_insights table

---

## FUNCTION 6: format_claude_prompt_data
**Purpose**: Package data for Claude Actions AI analysis

**Input Parameters:**
- `client_id` (integer): Target client

**Return Type:** text (formatted prompt string)

**Function Code:**
```javascript
// Get inventory gaps
const gaps = generate_inventory_gaps(client_id);

// Get pricing data
const pricing = query(
  `SELECT
     v1.make, v1.model,
     AVG(v1.dealer_price) as client_avg,
     AVG(v2.dealer_price) as competitor_avg,
     COUNT(v2.id) as competitor_count
   FROM vehicles v1
   LEFT JOIN vehicles v2 ON v1.make = v2.make AND v1.model = v2.model
     AND v2.client_id = v1.client_id AND v2.source_type = 'competitor'
   WHERE v1.client_id = ? AND v1.source_type = 'owned' AND v1.deleted_at IS NULL
   GROUP BY v1.make, v1.model
   HAVING competitor_count > 0`,
  [client_id]
);

// Get SEO keyword opportunities
const keywords = query(
  `SELECT keyword, search_volume, domain_name, ranking_position
   FROM spyfu_seo_keywords
   WHERE client_id = ? AND search_volume > 500 AND ranking_position <= 10
   ORDER BY search_volume DESC
   LIMIT 20`,
  [client_id]
);

// Format prompt
let prompt = `# COMPETITIVE INTELLIGENCE ANALYSIS REQUEST\n\n`;
prompt += `## Client ID: ${client_id}\n\n`;

prompt += `## 1. INVENTORY GAPS\n`;
gaps.forEach(gap => {
  prompt += `- ${gap.make} ${gap.model}: ${gap.gap_type} (Competitor has ${gap.competitor_count} units)\n`;
});

prompt += `\n## 2. PRICING COMPARISON\n`;
pricing.forEach(p => {
  const diff = p.client_avg - p.competitor_avg;
  const direction = diff > 0 ? "higher" : "lower";
  prompt += `- ${p.make} ${p.model}: Your avg $${p.client_avg} vs Competitor avg $${p.competitor_avg} (${direction} by $${Math.abs(diff).toFixed(0)})\n`;
});

prompt += `\n## 3. SEO KEYWORD OPPORTUNITIES\n`;
keywords.forEach(kw => {
  prompt += `- "${kw.keyword}" (${kw.search_volume}/mo, Competitor "${kw.domain_name}" ranks #${kw.ranking_position})\n`;
});

prompt += `\n## YOUR TASK:\n`;
prompt += `Generate 5-7 bullet-point action items covering:\n`;
prompt += `- Inventory acquisition recommendations\n`;
prompt += `- Pricing strategy adjustments\n`;
prompt += `- SEO/SEM conquest opportunities\n`;
prompt += `- Specific keywords to target\n\n`;
prompt += `Format each action as:\n`;
prompt += `[ACTION_TYPE] - [TITLE]: [DESCRIPTION]`;

return prompt;
```

**Usage:**
- Called before sending request to Claude API
- Output becomes system prompt for competitive analysis
- Response parsed and inserted into claude_actions table

---

## API ENDPOINT IMPLEMENTATION GUIDE

### POST /api/ingest/vehicles

**Xano Stack Setup:**

1. **Authentication**: Add Auth Token middleware
2. **Input Validation**:
   ```javascript
   // Verify required fields
   if (!inputs.client_id || !inputs.vehicles || !Array.isArray(inputs.vehicles)) {
     return { error: "Missing required fields", code: 400 };
   }

   // Verify client ownership
   const client = query("SELECT id FROM clients WHERE id = ? AND xano_user_id = ?",
     [inputs.client_id, auth_user.id]
   );
   if (!client) {
     return { error: "Unauthorized", code: 403 };
   }
   ```

3. **Main Processing Loop**:
   ```javascript
   let stats = {
     records_processed: 0,
     records_inserted: 0,
     records_updated: 0,
     records_failed: 0,
     schema_detected: "unknown"
   };

   // Detect schema from first record
   if (inputs.vehicles.length > 0) {
     stats.schema_detected = detect_dealer_schema(inputs.vehicles[0]);
   }

   // Process each vehicle
   inputs.vehicles.forEach(raw_vehicle => {
     try {
       stats.records_processed++;

       // Normalize
       const normalized = normalize_vehicle_data(
         stats.schema_detected,
         raw_vehicle,
         inputs.client_id,
         inputs.dealer_name,
         inputs.source_url,
         inputs.source_type || "competitor"
       );

       // Upsert
       const result = upsert_vehicle(normalized);

       if (result === "inserted") stats.records_inserted++;
       if (result === "updated") stats.records_updated++;
       if (result === "error") stats.records_failed++;

     } catch (error) {
       stats.records_failed++;
     }
   });

   // Create scrape log
   const log_id = query(
     `INSERT INTO scrape_logs
       (client_id, scrape_type, source_url, status, records_found,
        records_inserted, records_updated, records_failed, triggered_by,
        started_at, completed_at, created_at)
      VALUES (?, 'vehicles', ?, 'success', ?, ?, ?, ?, 'api', NOW(), NOW(), NOW())`,
     [inputs.client_id, inputs.source_url, stats.records_processed,
      stats.records_inserted, stats.records_updated, stats.records_failed]
   );

   return {
     success: true,
     scrape_log_id: log_id.insertId,
     ...stats
   };
   ```

---

## ERROR HANDLING PATTERNS

**Standard Error Response:**
```javascript
{
  "success": false,
  "error_code": "SCHEMA_DETECTION_FAILED",
  "message": "Unable to detect dealer schema from input data",
  "debug_info": {
    "sample_keys": Object.keys(raw_data).slice(0, 5)
  }
}
```

**Error Codes:**
- `INVALID_CLIENT_ID`: Client doesn't exist or unauthorized
- `SCHEMA_DETECTION_FAILED`: Unknown JSON structure
- `MISSING_VIN`: Vehicle record lacks VIN
- `DUPLICATE_VIN_CONFLICT`: VIN exists with different client_id
- `NORMALIZATION_ERROR`: Field mapping failed
- `DATABASE_ERROR`: Query execution failure

---

## TESTING CHECKLIST

- [ ] Test detect_dealer_schema with both JSON samples
- [ ] Test normalize_vehicle_data produces valid output
- [ ] Test upsert_vehicle with new VIN
- [ ] Test upsert_vehicle with existing VIN (update path)
- [ ] Test price change detection creates insight
- [ ] Test POST /api/ingest/vehicles with 100 records
- [ ] Test POST /api/ingest/vehicles with invalid client_id
- [ ] Verify multi-tenant isolation (client A can't see client B data)
- [ ] Test scrape_logs creation
- [ ] Test inventory gap analysis

---

## DEPLOYMENT STEPS

1. **Create Xano Tables** (use xano_schema_design.md)
2. **Create Custom Functions** (copy code from this doc)
3. **Create API Endpoints** (follow stack setup)
4. **Test with Postman**:
   ```bash
   curl -X POST https://your-xano-instance.com/api/ingest/vehicles \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d @/vercel/sandbox/uploads/simplescraper-www-midstatechevy-com-2025-12-31T12-10-37.json
   ```
5. **Enable Logging** (Xano → Logs → Enable all)
6. **Monitor Performance** (aim for < 2 sec per 100 records)

---

## PERFORMANCE OPTIMIZATION

**Batch Processing:**
- Process vehicles in chunks of 100
- Use Xano background tasks for > 500 records
- Cache schema_type detection per batch

**Database Optimization:**
- Ensure indexes exist on client_id, vin, make, model
- Use prepared statements (Xano handles this)
- Avoid SELECT * queries

**Rate Limiting:**
- Limit to 10 requests/min per client_id
- Use Xano's built-in rate limiter
- Return 429 status with retry-after header

---

**Next File:** thunderbit_scraper_config.md (Scraper recipe for DealerInspire sites)
