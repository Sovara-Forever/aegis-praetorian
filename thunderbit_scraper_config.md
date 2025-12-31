# THUNDERBIT / BROWSE AI SCRAPER CONFIGURATION
## DealerInspire Vehicle Inventory Scraper

---

## OVERVIEW

**Target Sites:**
- DealerInspire-powered dealer websites (Pattern A & B)
- Example URLs:
  - https://www.midstatechevy.com/new-vehicles/
  - https://www.cherryhillvw.com/new-vehicles/
  - https://www.harrygreenchevy.com/new-inventory/

**Scraper Goal:**
Extract all vehicle listings with: year, make, model, trim, VIN, stock #, MSRP, dealer price, images, features, incentives

**Output Format:** JSON array ready for Xano ingestion

**Frequency:** Daily scrapes (Zapier scheduled trigger)

---

## SCRAPER SETUP - THUNDERBIT

### Step 1: Create New Recipe

1. **Login to Thunderbit** → Dashboard → "Create New Recipe"
2. **Recipe Type**: "Data Extraction"
3. **Name**: "DealerInspire Vehicle Scraper - [DealerName]"
4. **Description**: "Scrapes new vehicle inventory for competitive analysis"

### Step 2: Define Target URL Pattern

**Base URL Template:**
```
https://www.[DEALER_DOMAIN]/new-vehicles/
```

**Pagination Pattern:**
```
https://www.[DEALER_DOMAIN]/new-vehicles/?page={page_number}
```

**Thunderbit Settings:**
- **Pagination Type**: URL parameter
- **Page Parameter**: `page`
- **Start Page**: 1
- **Max Pages**: 10 (or "Auto-detect last page")
- **Wait Between Pages**: 2 seconds (avoid rate limiting)

### Step 3: Configure Selectors - PATTERN A (Midstate Chevy Style)

**Container Selector:**
```css
div.vehicle-card
```

**Field Selectors:**

| Field Name | CSS Selector | Data Type | Extraction Method |
|------------|-------------|-----------|-------------------|
| vehicle-title--condition | `.vehicle-title--condition` | text | innerText |
| vehicle-title--year | `.vehicle-title--year` | text | innerText |
| vehicle-title--make-model | `.vehicle-title--make-model` | text | innerText |
| vehicle-title--trim | `.vehicle-title--trim` | text | innerText |
| vehicle-identifiers--value | `.vehicle-identifiers--value` | text | innerText (VIN) |
| vehicle-identifiers--value_2 | `.vehicle-identifiers--value:nth-of-type(2)` | text | innerText (Stock #) |
| vehicle-pricing-highlight-amount | `.vehicle-pricing-highlight-amount` | text | innerText (Dealer Price) |
| vehicle-pricing-highlight-amount_2 | `.vehicle-pricing-highlight-amount:nth-of-type(2)` | text | innerText (MSRP) |
| vehicle-specifications--item | `.vehicle-specifications--item:nth-of-type(1)` | text | innerText (Mileage) |
| vehicle-specifications--item_2 | `.vehicle-specifications--item:nth-of-type(2)` | text | innerText (Exterior Color) |
| vehicle-specifications--item_3 | `.vehicle-specifications--item:nth-of-type(3)` | text | innerText (Interior Color) |
| vehicle-card-link | `a.vehicle-card-link` | attribute | href (Detail Page URL) |
| vehicle-image | `.vehicle-card img` | attribute | src (Primary Image) |

**Advanced Selector (if above fails):**
```css
/* Fallback for DealerInspire variations */
div[data-test="vehicle-card"] .vehicle-info
```

### Step 4: Configure Selectors - PATTERN B (Cherry Hill VW Style)

**Container Selector:**
```css
div.hit-vehicle-card
```

**Field Selectors:**

| Field Name | CSS Selector | Data Type | Extraction Method |
|------------|-------------|-----------|-------------------|
| title-top | `.title-top` | text | innerText (Condition + Year) |
| title-bottom | `.title-bottom` | text | innerText (Make + Model + Trim) |
| stock-row | `.stock-row` | text | innerText |
| vin-row | `.vin-row` | text | innerText |
| price | `.price:nth-of-type(1)` | text | innerText (MSRP) |
| strong:contains("Price") + .price` | `strong:contains("Price") ~ div` | text | innerText (Dealer Price) |
| price-label_3 | `.price-label:nth-of-type(3)` | text | innerText (Incentive 1 Name) |
| price_3 | `.price:nth-of-type(3)` | text | innerText (Incentive 1 Value) |
| price-label_4 | `.price-label:nth-of-type(4)` | text | innerText (Incentive 2 Name) |
| price_4 | `.price:nth-of-type(4)` | text | innerText (Incentive 2 Value) |
| price-label_5 | `.price-label:nth-of-type(5)` | text | innerText (Incentive 3 Name) |
| price_5 | `.price:nth-of-type(5)` | text | innerText (Incentive 3 Value) |
| price-label_6 | `.price-label:nth-of-type(6)` | text | innerText (Incentive 4 Name) |
| price_6 | `.price:nth-of-type(6)` | text | innerText (Incentive 4 Value) |
| price-label_7 | `.price-label:nth-of-type(7)` | text | innerText (Incentive 5 Name) |
| price_7 | `.price:nth-of-type(7)` | text | innerText (Incentive 5 Value) |
| price-label_8 | `.price-label:nth-of-type(8)` | text | innerText (Incentive 6 Name) |
| price_8 | `.price:nth-of-type(8)` | text | innerText (Incentive 6 Value) |
| hit-link | `.hit-link` | attribute | src (Primary Image) |
| _container_link | `a.hit-vehicle-card` | attribute | href (Detail Page URL) |
| hit-special | `.hit-special` | text | innerText (Special Offer Badge) |

### Step 5: Data Transformation Rules

**Thunderbit Post-Processing:**

1. **Remove Empty Fields**: Enable "Skip null values"
2. **Trim Whitespace**: Enable on all text fields
3. **Price Cleaning**:
   - Remove `$` symbol
   - Remove commas
   - Store as text (Xano will convert to decimal)
4. **VIN Validation**:
   - Length must = 17 characters
   - Skip record if invalid

**Transformation Script (if Thunderbit supports JS):**
```javascript
// Optional: Clean data before export
records.forEach(record => {
  // Clean VIN
  if (record["vin-row"]) {
    record["vin-row"] = record["vin-row"].replace("VIN: ", "").trim();
  }

  // Clean stock number
  if (record["stock-row"]) {
    record["stock-row"] = record["stock-row"].replace("Stock: ", "").trim();
  }

  // Clean prices
  ["price", "strong_2", "price_3", "price_4", "price_5", "price_6", "price_7", "price_8"].forEach(key => {
    if (record[key]) {
      record[key] = record[key].replace(/[$,]/g, "").trim();
    }
  });
});
```

### Step 6: Browser Configuration

**Thunderbit Browser Settings:**
- **User Agent**: Desktop Chrome (avoid mobile layout)
- **Viewport**: 1920x1080
- **Wait for**: 3 seconds after page load (for lazy-loaded images)
- **JavaScript**: Enabled (required for DealerInspire)
- **Cookies**: Accept all (some sites require cookie consent)
- **Scroll Behavior**: Scroll to bottom before scraping (triggers lazy load)

**Anti-Detection:**
- **Randomize delays**: 1-3 seconds between pages
- **Rotate proxy** (if scraping > 5 sites)
- **Limit rate**: Max 1 page per 2 seconds

### Step 7: Error Handling

**Retry Logic:**
- **Max Retries**: 3 per page
- **Retry Delay**: 5 seconds (exponential backoff)
- **Skip on Failure**: Yes (continue to next page)

**Notification Settings:**
- **Email Alert** if:
  - Zero records scraped (site structure changed)
  - Error rate > 20%
  - Scrape time > 10 minutes

### Step 8: Output Configuration

**Export Format:** JSON

**Sample Output Structure:**
```json
{
  "dealer_name": "Midstate Chevrolet",
  "dealer_website": "midstatechevy.com",
  "scrape_date": "2025-12-31T12:00:00Z",
  "total_vehicles": 100,
  "vehicles": [
    {
      "vehicle-title--condition": "New",
      "vehicle-title--year": "2026",
      "vehicle-title--make-model": "Chevrolet Silverado 1500",
      "vehicle-title--trim": "LT",
      "vehicle-identifiers--value": "1GCUDAED5RZ123456",
      "vehicle-identifiers--value_2": "50040123",
      "vehicle-pricing-highlight-amount_2": "$54,995",
      "vehicle-pricing-highlight-amount": "$744",
      "vehicle-specifications--item": "12 miles",
      "vehicle-specifications--item_2": "Summit White",
      "vehicle-specifications--item_3": "Jet Black",
      "vehicle-card-link": "https://www.midstatechevy.com/inventory/new-2026-chevrolet-silverado-1500-lt-4wd-crew-cab-pickup-1gcudaed5rz123456/",
      "vehicle-image": "https://vehicle-images.dealerinspire.com/..."
    }
  ]
}
```

**Webhook Delivery:**
- **Method**: POST
- **URL**: `https://your-xano-instance.com/api/ingest/vehicles`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_XANO_API_KEY"
  }
  ```
- **Body**: Raw JSON output

---

## BROWSE AI ALTERNATIVE CONFIGURATION

If using Browse AI instead of Thunderbit:

### Step 1: Create Robot

1. **Browse AI Dashboard** → "Create Robot"
2. **Robot Type**: "List Extractor"
3. **Start URL**: `https://www.midstatechevy.com/new-vehicles/`

### Step 2: Train Robot

**Training Mode:**
1. Click on first vehicle card
2. **Capture Fields**:
   - Right-click → "Extract text" on year, make, model, VIN, prices
   - Right-click → "Extract attribute" on image (src) and link (href)
3. **Select Similar Elements** → Browse AI will find all vehicle cards
4. **Verify**: Preview shows all vehicles on page

### Step 3: Configure Pagination

**Pagination Type**: "Next Button"
- **Selector**: `a.pagination-next` or `button:contains("Next")`
- **Max Pages**: 10

**Alternative - URL Pattern:**
```
https://www.midstatechevy.com/new-vehicles/?page={1...10}
```

### Step 4: Schedule Robot

**Run Frequency**: Daily at 3:00 AM EST
**Timezone**: America/New_York
**On Failure**: Retry 2 times, then alert

### Step 5: Output Delivery

**Integration**: Webhooks
- **Trigger**: On task completion
- **Webhook URL**: `https://your-xano-instance.com/api/ingest/vehicles`
- **Method**: POST
- **Custom Headers**: Add Authorization token

**Data Mapping:**
```json
{
  "client_id": 1,
  "dealer_name": "Midstate Chevrolet",
  "source_url": "midstatechevy.com",
  "source_type": "competitor",
  "vehicles": "{{robot.result}}"
}
```

---

## MULTI-SITE SCRAPING STRATEGY

### Approach 1: One Recipe Per Dealer (Recommended for Testing)

**Pros:**
- Custom selectors per site
- Easier debugging
- Isolated failures

**Cons:**
- More recipes to manage

**Setup:**
- Create 5 separate Thunderbit recipes
- Name: "Scraper - [DealerName]"
- Each has own Zapier trigger

### Approach 2: Dynamic URL List (For Scale)

**Pros:**
- Single recipe handles all sites
- Centralized management

**Cons:**
- Selector must work across all sites
- Complex error handling

**Setup:**
1. **Thunderbit URL List**:
   ```
   https://www.midstatechevy.com/new-vehicles/
   https://www.cherryhillvw.com/new-vehicles/
   https://www.harrygreenchevy.com/new-vehicles/
   https://www.victoryautowreckers.com/new-vehicles/
   https://www.route23honda.com/new-inventory/
   ```

2. **Use Generic Selectors**:
   ```css
   /* Works across most DealerInspire sites */
   div[class*="vehicle-card"],
   div[class*="hit-vehicle"]
   ```

3. **Xano Schema Detection** handles variations

---

## TESTING PROTOCOL

### Phase 1: Single Site Test

1. **Run Scraper** on Midstate Chevy
2. **Verify Output**:
   - All 100 vehicles captured?
   - VINs valid (17 chars)?
   - Prices formatted correctly?
3. **Manual Spot Check**:
   - Compare 5 random vehicles against live site
   - Verify data accuracy

### Phase 2: Xano Integration Test

1. **Send Output** to Xano POST /api/ingest/vehicles
2. **Check Response**:
   ```json
   {
     "success": true,
     "records_inserted": 85,
     "records_updated": 15,
     "schema_detected": "DealerInspire_A"
   }
   ```
3. **Query Database**: Verify vehicles table populated

### Phase 3: Multi-Site Test

1. **Add 2nd Dealer** (Cherry Hill VW)
2. **Verify Schema Detection** switches to Pattern B
3. **Check Data Isolation**: client_id correctly assigned

### Phase 4: Error Simulation

1. **Break Selector** intentionally
2. **Verify Email Alert** fires
3. **Check Scrape Logs** in Xano

---

## MAINTENANCE PLAN

**Weekly:**
- [ ] Review scrape logs for failures
- [ ] Check data freshness (last_seen_at timestamps)
- [ ] Verify vehicle counts match live site

**Monthly:**
- [ ] Update selectors if site redesign detected
- [ ] Review proxy/rate limit errors
- [ ] Optimize scrape times (reduce from 10 min → 5 min)

**Quarterly:**
- [ ] Add new competitor sites
- [ ] Archive deleted vehicles (soft delete cleanup)
- [ ] Performance audit (database indexes)

---

## TROUBLESHOOTING GUIDE

### Issue: Zero Records Scraped

**Possible Causes:**
1. Site structure changed (CSS selectors outdated)
2. Site blocking bot traffic
3. JavaScript not loading

**Fix:**
1. Open Thunderbit debugger → View page source
2. Inspect element → Find new selectors
3. Update recipe selectors
4. Enable "Wait for element" if lazy-loaded

### Issue: Duplicate VINs Across Clients

**Cause:** Same vehicle listed on multiple dealer sites

**Fix:**
- Xano upsert_vehicle function handles this
- Vehicle belongs to client who most recently scraped it
- Add `original_client_id` field if tracking needed

### Issue: Prices Missing or $0

**Cause:** Dealer uses "Call for Price" or dynamic pricing

**Fix:**
- Scraper should capture text "Call for Price"
- Xano sets dealer_price = NULL
- Frontend displays "Contact Dealer"

### Issue: Images Not Loading

**Cause:** Lazy-loaded images or CDN URLs

**Fix:**
- Thunderbit: Enable "Scroll to element" before scrape
- Extract `data-src` attribute instead of `src`
- Add 2-second wait after page load

---

## COST BREAKDOWN - THUNDERBIT PRO

**Plan:** Pro ($29/month)
- **Tasks**: 10,000 per month
- **1 Scrape Run** = ~100 vehicles = 100 tasks
- **Daily scrapes of 5 sites** = 500 tasks/day = 15,000/month

**Recommendation:** Upgrade to Business ($79/month) for 50K tasks if > 5 sites

**Alternative - Browse AI:**
- **Plan:** Professional ($49/month)
- **Robots**: 25 robots
- **Tasks**: 10,000 per month
- Similar capacity

---

## ZAPIER INTEGRATION (Next Section)

**Trigger:** Thunderbit → On Recipe Complete
**Action:** HTTP POST to Xano
**Next Step:** See `zapier_orchestration.md`

---

## SELECTOR CHEAT SHEET

**Common DealerInspire Patterns:**

| Element | CSS Selector |
|---------|--------------|
| Vehicle Card | `div.vehicle-card`, `div.hit-vehicle-card` |
| Year | `.vehicle-title--year`, extract from `.title-top` |
| Make/Model | `.vehicle-title--make-model`, `.title-bottom` |
| VIN | `.vehicle-identifiers--value`, `.vin-row` |
| MSRP | `.vehicle-pricing-highlight-amount_2`, `.price:first` |
| Dealer Price | `.vehicle-pricing-highlight-amount`, `.strong:contains("Price")` |
| Image | `img.vehicle-card-image`, `.hit-link` |
| Detail Link | `a.vehicle-card-link`, `a._container_link` |
| Pagination Next | `a.pagination-next`, `button[aria-label="Next"]` |

**XPath Alternatives (if CSS fails):**
```xpath
//div[contains(@class, 'vehicle-card')]
//span[contains(text(), 'VIN:')]/following-sibling::span
```

---

## SUCCESS CRITERIA

- [ ] 95%+ vehicle capture rate
- [ ] < 5% error rate per scrape
- [ ] Scrape completes in < 10 minutes
- [ ] Zero manual intervention required
- [ ] Data accuracy validated against live site

---

**Next Document:** `xano_api_endpoints.md` (Detailed endpoint implementation)
