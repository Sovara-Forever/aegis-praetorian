# XANO DATABASE SCHEMA - Multi-Tenant Competitive Intelligence Platform

## Core Design Principles
- **Multi-Tenancy**: Every table includes `client_id` (integer, indexed)
- **Soft Deletes**: Use `deleted_at` timestamp instead of hard deletes
- **Audit Trail**: Include `created_at` and `updated_at` on all tables
- **Performance**: Index all foreign keys and frequently queried fields

---

## TABLE 1: clients
**Purpose**: Master client/dealer account table

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| company_name | text | yes | yes | Dealer name (e.g., "Midstate Chevy") |
| subdomain | text | yes | UNIQUE | WeWeb subdomain (e.g., "midstate") |
| dealer_website | text | yes | - | Source URL (e.g., "midstatechevy.com") |
| dealer_type | text | yes | yes | "DealerInspire_A", "DealerInspire_B", "CDK", etc. |
| zip_code | text | no | yes | Dealer primary ZIP |
| city | text | no | - | - |
| state | text | no | yes | - |
| status | text | yes | yes | "active", "trial", "suspended" |
| subscription_tier | text | yes | - | "basic", "pro", "enterprise" |
| xano_user_id | integer | yes | FOREIGN | Links to Xano auth user |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |
| deleted_at | timestamp | no | - | Soft delete |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (subdomain)
- INDEX (dealer_type, status)
- FOREIGN KEY (xano_user_id) REFERENCES user(id)

---

## TABLE 2: vehicles
**Purpose**: Normalized vehicle inventory (client's own + competitors)

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| source_type | text | yes | yes | "owned", "competitor" |
| dealer_name | text | yes | yes | Source dealer name |
| dealer_website | text | no | yes | Source URL |
| year | integer | yes | yes | Vehicle year |
| make | text | yes | yes | "Chevrolet", "Volkswagen", etc. |
| model | text | yes | yes | "Silverado", "Jetta", etc. |
| trim | text | no | yes | "LT", "Sport", "SE", etc. |
| vin | text | yes | UNIQUE | Vehicle VIN |
| stock_number | text | no | yes | Dealer stock # |
| msrp | decimal(10,2) | no | yes | Manufacturer price |
| dealer_price | decimal(10,2) | no | yes | Actual selling price |
| discount_amount | decimal(10,2) | no | - | Calculated: msrp - dealer_price |
| discount_percent | decimal(5,2) | no | - | Calculated percentage |
| mileage | integer | no | - | Odometer reading |
| condition | text | yes | yes | "new", "used", "certified" |
| exterior_color | text | no | yes | - |
| interior_color | text | no | - | - |
| body_style | text | no | yes | "sedan", "suv", "truck", etc. |
| transmission | text | no | - | - |
| drivetrain | text | no | - | "FWD", "AWD", "4WD" |
| fuel_type | text | no | - | - |
| engine | text | no | - | - |
| image_url_primary | text | no | - | Main vehicle photo |
| image_urls_json | json | no | - | Array of additional photos |
| features_json | json | no | - | Array of features |
| incentives_json | json | no | - | Array of special offers |
| url_detail_page | text | no | - | Link to vehicle detail page |
| days_on_lot | integer | no | yes | Calculated from first_seen_at |
| first_seen_at | timestamp | yes | yes | When first scraped |
| last_seen_at | timestamp | yes | yes | Last scrape date |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |
| deleted_at | timestamp | no | - | Soft delete (vehicle sold/removed) |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (vin)
- INDEX (client_id, source_type, condition)
- INDEX (make, model, year)
- INDEX (dealer_price)
- INDEX (days_on_lot DESC)
- FOREIGN KEY (client_id) REFERENCES clients(id)

**Xano Functions Needed:**
- `calculate_discount_amount`: msrp - dealer_price
- `calculate_discount_percent`: ((msrp - dealer_price) / msrp) * 100
- `calculate_days_on_lot`: DATEDIFF(NOW(), first_seen_at)

---

## TABLE 3: geo_sales
**Purpose**: Geographic sales data by ZIP code and model

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| zip_code | text | yes | yes | 5-digit ZIP |
| city | text | no | - | - |
| state | text | no | yes | - |
| dealer_name | text | yes | yes | - |
| make | text | yes | yes | - |
| model | text | yes | yes | - |
| units_sold | integer | yes | - | Sales count |
| total_revenue | decimal(12,2) | no | - | Total $ from sales |
| avg_sale_price | decimal(10,2) | no | - | Average transaction price |
| period_start | date | yes | yes | Start of reporting period |
| period_end | date | yes | yes | End of reporting period |
| distance_from_client | decimal(5,2) | no | yes | Miles from client location |
| market_share_percent | decimal(5,2) | no | - | % of total sales in ZIP |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, zip_code, period_end)
- INDEX (dealer_name, make, model)
- INDEX (distance_from_client)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 4: spyfu_competitors
**Purpose**: Competitor domain analysis (SEO/SEM)

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| domain_name | text | yes | yes | "harrygreenchevy.com" |
| domain_authority | integer | no | - | SEO score |
| monthly_seo_clicks | integer | no | yes | Organic traffic estimate |
| monthly_ppc_budget | decimal(10,2) | no | yes | Estimated ad spend |
| total_keywords | integer | no | - | # of ranking keywords |
| paid_keywords | integer | no | - | # of PPC keywords |
| organic_keywords | integer | no | - | # of SEO keywords |
| backlinks_count | integer | no | - | Total backlinks |
| referring_domains | integer | no | - | Unique domains linking |
| competitor_overlap_score | decimal(5,2) | no | yes | 0-100 similarity to client |
| data_fetch_date | date | yes | yes | When data was pulled |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, domain_name)
- INDEX (monthly_seo_clicks DESC)
- INDEX (monthly_ppc_budget DESC)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 5: spyfu_seo_keywords
**Purpose**: Organic keyword rankings for competitors

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| domain_name | text | yes | yes | Competitor domain |
| keyword | text | yes | yes | "chevrolet silverado new jersey" |
| search_volume | integer | no | yes | Monthly searches |
| ranking_position | integer | no | yes | 1-100 |
| ranking_url | text | no | - | Landing page URL |
| difficulty_score | integer | no | - | 0-100 competition level |
| cpc_value | decimal(6,2) | no | - | Cost per click if paid |
| is_branded | boolean | yes | yes | Contains dealer/brand name? |
| category | text | no | yes | "inventory", "service", "parts", etc. |
| data_fetch_date | date | yes | yes | - |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, keyword, domain_name)
- INDEX (search_volume DESC)
- INDEX (ranking_position)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 6: google_search_terms
**Purpose**: Google Ads search query performance

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| search_term | text | yes | yes | Actual user query |
| impressions | integer | no | - | Ad shows |
| clicks | integer | no | - | Ad clicks |
| ctr | decimal(5,2) | no | - | Click-through rate |
| cost | decimal(10,2) | no | - | Total spend |
| conversions | integer | no | - | Leads/sales |
| cost_per_conversion | decimal(10,2) | no | yes | CPA |
| conversion_rate | decimal(5,2) | no | - | - |
| campaign_name | text | no | yes | Google Ads campaign |
| period_start | date | yes | yes | - |
| period_end | date | yes | yes | - |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, period_end)
- INDEX (search_term, cost DESC)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 7: ads_daily
**Purpose**: Daily PPC performance metrics

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| ad_platform | text | yes | yes | "google_ads", "facebook", "bing" |
| campaign_name | text | yes | yes | - |
| date | date | yes | yes | Reporting date |
| impressions | integer | no | - | - |
| clicks | integer | no | - | - |
| cost | decimal(10,2) | no | - | - |
| conversions | integer | no | - | - |
| revenue | decimal(10,2) | no | - | Attributed revenue |
| roas | decimal(6,2) | no | - | Return on ad spend |
| created_at | timestamp | yes | - | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, date DESC)
- INDEX (ad_platform, campaign_name)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 8: market_insights
**Purpose**: Aggregated competitive intelligence reports

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| insight_type | text | yes | yes | "inventory_gap", "pricing_alert", "seo_opportunity" |
| title | text | yes | - | "Competitors discounting Silverado 20% more" |
| description | text | yes | - | Full insight details |
| priority | text | yes | yes | "high", "medium", "low" |
| category | text | yes | yes | "inventory", "pricing", "seo", "sem" |
| data_source | text | no | - | "vehicles", "geo_sales", "spyfu_keywords" |
| action_items_json | json | no | - | Array of recommended actions |
| metrics_json | json | no | - | Supporting data/charts |
| is_read | boolean | yes | yes | Dashboard notification state |
| expires_at | timestamp | no | yes | Time-sensitive insights |
| created_at | timestamp | yes | yes | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, is_read, created_at DESC)
- INDEX (priority, category)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 9: scrape_logs
**Purpose**: Track scraper runs and data freshness

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| scrape_type | text | yes | yes | "vehicles", "geo_sales", "spyfu" |
| source_url | text | yes | - | URL or data source |
| status | text | yes | yes | "success", "partial", "failed" |
| records_found | integer | no | - | # of records scraped |
| records_inserted | integer | no | - | # successfully added |
| records_updated | integer | no | - | # updated |
| records_failed | integer | no | - | # with errors |
| error_log_json | json | no | - | Error details if any |
| execution_time_seconds | integer | no | - | Duration |
| triggered_by | text | yes | - | "zapier", "manual", "scheduled" |
| started_at | timestamp | yes | yes | - |
| completed_at | timestamp | no | - | - |
| created_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, scrape_type, status)
- INDEX (started_at DESC)
- FOREIGN KEY (client_id) REFERENCES clients(id)

---

## TABLE 10: claude_actions
**Purpose**: AI-generated competitive action items

| Field Name | Type | Required | Index | Notes |
|------------|------|----------|-------|-------|
| id | integer | yes | PRIMARY | Auto-increment |
| client_id | integer | yes | FOREIGN | Owner of this data |
| action_type | text | yes | yes | "seo", "sem", "inventory", "pricing" |
| title | text | yes | - | "Target 'used silverado nj' keyword" |
| description | text | yes | - | Full AI-generated strategy |
| rationale | text | no | - | Why this action matters |
| priority_score | integer | yes | yes | 1-10 calculated by AI |
| estimated_impact | text | no | - | "high", "medium", "low" |
| effort_level | text | no | - | "quick_win", "moderate", "complex" |
| related_competitor | text | no | yes | Domain if competitor-specific |
| data_snapshot_json | json | no | - | Supporting metrics |
| is_completed | boolean | yes | yes | User marks done |
| completed_at | timestamp | no | - | - |
| created_by_insight_id | integer | no | FOREIGN | Links to market_insights(id) |
| created_at | timestamp | yes | yes | - |
| updated_at | timestamp | yes | - | - |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (client_id, is_completed, priority_score DESC)
- INDEX (action_type, estimated_impact)
- FOREIGN KEY (client_id) REFERENCES clients(id)
- FOREIGN KEY (created_by_insight_id) REFERENCES market_insights(id)

---

## SCHEMA DETECTION RULES FOR XANO FUNCTION

```javascript
// Xano Function: detect_dealer_schema(input_json)
// Returns: "DealerInspire_A", "DealerInspire_B", "unknown"

function detectDealerSchema(jsonRecord) {
  const keys = Object.keys(jsonRecord);

  // Pattern A: Midstate Chevy style
  if (keys.includes("vehicle-title--year") &&
      keys.includes("vehicle-identifiers--value") &&
      keys.includes("vehicle-pricing-highlight-amount")) {
    return "DealerInspire_A";
  }

  // Pattern B: Cherry Hill VW style
  if (keys.includes("title-top") &&
      keys.includes("vin-row") &&
      keys.includes("stock-row")) {
    return "DealerInspire_B";
  }

  return "unknown";
}
```

---

## FIELD MAPPING RULES FOR XANO FUNCTION

```javascript
// Xano Function: normalize_vehicle_data(schema_type, input_json, client_id)
// Returns: normalized vehicle object for database insert

function normalizeVehicleData(schemaType, raw, clientId) {
  let normalized = {
    client_id: clientId,
    source_type: "competitor", // Default, override if client's own
    first_seen_at: new Date(),
    last_seen_at: new Date()
  };

  if (schemaType === "DealerInspire_A") {
    // Midstate Chevy mapping
    normalized.year = parseInt(raw["vehicle-title--year"]);
    normalized.make = raw["vehicle-title--make-model"]?.split(" ")[0];
    normalized.model = raw["vehicle-title--make-model"]?.split(" ").slice(1).join(" ");
    normalized.trim = raw["vehicle-title--trim"];
    normalized.vin = raw["vehicle-identifiers--value"];
    normalized.stock_number = raw["vehicle-identifiers--value_2"];
    normalized.msrp = parseFloat(raw["vehicle-pricing-highlight-amount_2"]?.replace(/[$,]/g, ""));
    normalized.dealer_price = parseFloat(raw["vehicle-pricing-highlight-amount"]?.replace(/[$,]/g, ""));
    normalized.condition = raw["vehicle-title--condition"]?.toLowerCase();
    normalized.image_url_primary = raw["vehicle-card-link"];
    normalized.url_detail_page = raw["vehicle-card-link"];

  } else if (schemaType === "DealerInspire_B") {
    // Cherry Hill VW mapping
    const titleParts = raw["title-top"]?.split(" ");
    normalized.condition = titleParts[0]?.toLowerCase();
    normalized.year = parseInt(titleParts[1]);
    normalized.make = raw["title-bottom"]?.split(" ")[0];
    normalized.model = raw["title-bottom"]?.split(" ").slice(1).join(" ");
    normalized.vin = raw["vin-row"]?.replace("VIN: ", "");
    normalized.stock_number = raw["stock-row"]?.replace("Stock: ", "");
    normalized.msrp = parseFloat(raw["price"]?.replace(/[$,]/g, ""));
    normalized.dealer_price = parseFloat(raw["strong_2"]?.replace(/[$,]/g, ""));
    normalized.image_url_primary = raw["hit-link"];
    normalized.url_detail_page = raw["_container_link"];

    // Parse incentives
    let incentives = [];
    for (let i = 3; i <= 8; i++) {
      if (raw[`price-label_${i}`]) {
        incentives.push({
          name: raw[`price-label_${i}`],
          value: raw[`price_${i}`]
        });
      }
    }
    normalized.incentives_json = incentives;
  }

  // Calculate derived fields
  if (normalized.msrp && normalized.dealer_price) {
    normalized.discount_amount = normalized.msrp - normalized.dealer_price;
    normalized.discount_percent = ((normalized.discount_amount / normalized.msrp) * 100).toFixed(2);
  }

  return normalized;
}
```

---

## XANO API ENDPOINTS REQUIRED

### 1. POST /api/ingest/vehicles
**Purpose**: Accept scraped JSON and normalize into vehicles table

**Request Body:**
```json
{
  "client_id": 1,
  "source_url": "midstatechevy.com",
  "dealer_name": "Midstate Chevrolet",
  "vehicles": [ /* array of raw scraped JSON objects */ ]
}
```

**Response:**
```json
{
  "success": true,
  "records_processed": 100,
  "records_inserted": 85,
  "records_updated": 15,
  "records_failed": 0,
  "schema_detected": "DealerInspire_A",
  "scrape_log_id": 42
}
```

**Logic Flow:**
1. Detect schema type from first record
2. Loop through vehicles array
3. For each record:
   - Normalize using appropriate mapping
   - Check if VIN exists (upsert logic)
   - Insert or update vehicles table
   - Update last_seen_at if exists
4. Create scrape_logs entry
5. Return summary

### 2. GET /api/vehicles/{client_id}
**Purpose**: Retrieve client's inventory + competitor data

**Query Params:**
- `source_type`: "owned" | "competitor" | "all"
- `make`: filter by make
- `model`: filter by model
- `condition`: "new" | "used" | "certified"
- `sort_by`: "price" | "year" | "days_on_lot"
- `page`: pagination
- `limit`: records per page

**Response:**
```json
{
  "total": 1250,
  "page": 1,
  "limit": 50,
  "vehicles": [ /* array of normalized vehicle objects */ ]
}
```

### 3. GET /api/insights/{client_id}
**Purpose**: Get AI-generated market insights

**Query Params:**
- `category`: "inventory" | "pricing" | "seo" | "sem"
- `is_read`: true | false
- `priority`: "high" | "medium" | "low"

**Response:**
```json
{
  "insights": [
    {
      "id": 123,
      "title": "Silverado 1500 pricing gap detected",
      "description": "Competitors are discounting 15% more than you",
      "priority": "high",
      "action_items": ["Adjust pricing", "Increase incentives"]
    }
  ]
}
```

### 4. GET /api/actions/{client_id}
**Purpose**: Get Claude AI action recommendations

**Response:**
```json
{
  "actions": [
    {
      "id": 45,
      "action_type": "seo",
      "title": "Target 'certified used silverado' keyword",
      "priority_score": 9,
      "estimated_impact": "high",
      "effort_level": "quick_win",
      "is_completed": false
    }
  ]
}
```

### 5. GET /api/geo-sales/{client_id}
**Purpose**: Get geographic sales heatmap data

**Query Params:**
- `radius_miles`: 30 | 50 | 75
- `model`: filter by specific model

**Response:**
```json
{
  "heatmap_data": [
    {
      "zip_code": "08002",
      "lat": 39.9526,
      "lng": -74.0060,
      "units_sold": 45,
      "market_share": 12.5,
      "distance_miles": 5.2
    }
  ]
}
```

---

## PERFORMANCE CONSIDERATIONS

1. **Indexes**: All multi-tenant queries MUST filter by client_id first
2. **Partitioning**: Consider partitioning vehicles table by year if > 100K records
3. **Caching**: Cache client config/settings in Xano for 15 min
4. **Rate Limiting**: Limit API calls to 100/min per client_id
5. **Async Jobs**: Use Xano background tasks for:
   - Bulk vehicle normalization (> 500 records)
   - Claude AI analysis generation
   - Report generation

---

## MULTI-TENANT SECURITY RULES

**Xano Function Middleware: enforce_client_isolation()**

```javascript
// CRITICAL: Every API endpoint MUST validate client_id
function enforceClientIsolation(requestedClientId, authenticatedUserId) {
  // Get user's client_id from clients table
  const userClient = query("SELECT id FROM clients WHERE xano_user_id = ?", authenticatedUserId);

  if (!userClient || userClient.id !== requestedClientId) {
    throw new Error("Unauthorized: Client ID mismatch");
  }

  return true;
}
```

**Row-Level Security Pattern:**
- NEVER allow SELECT without WHERE client_id = {authenticated_client_id}
- Use Xano's "Add auth token" middleware on all data endpoints
- Filter by client_id BEFORE any other WHERE conditions

---

## COST ESTIMATION (Target: < $300/mo)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Xano | Scale ($175) | $175 |
| WeWeb | Pro ($49) | $49 |
| Thunderbit | Pro ($29) | $29 |
| Zapier/Make | Starter ($20) | $20 |
| Mapbox | Free tier | $0 |
| **TOTAL** | | **$273** |

Remaining budget: $27 for overages/API calls

---

## NEXT STEPS FOR IMPLEMENTATION

1. ✅ Schema design complete
2. ⏭️ Create Xano tables (use schema above)
3. ⏭️ Build normalization functions (copy JS logic)
4. ⏭️ Create API endpoints (5 core endpoints)
5. ⏭️ Test with sample JSON files
6. ⏭️ Build Thunderbit scraper recipe
7. ⏭️ Design WeWeb dashboard
8. ⏭️ Create Zapier workflow
9. ⏭️ Generate Claude Actions prompts

**Priority**: Get vehicles table + POST ingest endpoint working first with one client flow.
