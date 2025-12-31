import { pgTable, text, integer, real, timestamp, serial, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";

// ============================================================================
// USER MANAGEMENT (Clerk Integration)
// ============================================================================

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
  isApproved: integer("is_approved").notNull().default(0), // 0 = pending, 1 = approved
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// INVENTORY VEHICLES
// ============================================================================

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vin: text("vin").notNull().unique(),
  year: integer("year").notNull(),
  make: text("make"),
  model: text("model").notNull(),
  trim: text("trim"),
  stockNumber: text("stock_number"),
  price: real("price"),
  msrp: real("msrp"),
  savings: real("savings"),
  mileage: integer("mileage"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  engine: text("engine"),
  fuelType: text("fuel_type"),
  status: text("status"),
  dealer: text("dealer"),
  location: text("location"),
  url: text("url"),
  imageUrl: text("image_url"),
  features: text("features"),
  scrapedDate: timestamp("scraped_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  vinIdx: uniqueIndex("vehicles_vin_idx").on(table.vin),
  makeModelIdx: index("vehicles_make_model_idx").on(table.make, table.model),
  dealerIdx: index("vehicles_dealer_idx").on(table.dealer),
  priceIdx: index("vehicles_price_idx").on(table.price),
}));

// ============================================================================
// ADS DAILY (Google Ads Performance)
// ============================================================================

export const adsDaily = pgTable("ads_daily", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  customerId: integer("customer_id").notNull(),
  accountName: text("account_name").notNull(),
  campaignId: integer("campaign_id").notNull(),
  campaignName: text("campaign_name").notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  cost: real("cost").notNull().default(0),
  conversions: real("conversions").notNull().default(0),
  convValue: real("conv_value"),
  searchImprShare: real("search_impr_share"),
  lostIsBudget: real("lost_is_budget"),
  lostIsRank: real("lost_is_rank"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("ads_daily_date_idx").on(table.date),
  campaignIdx: index("ads_daily_campaign_idx").on(table.campaignId),
}));

// ============================================================================
// GEO SALES (Geographic Sales Distribution)
// ============================================================================

export const geoSales = pgTable("geo_sales", {
  id: serial("id").primaryKey(),
  zip: text("zip").notNull(),
  radiusBand: text("radius_band").notNull(),
  distanceMi: real("distance_mi").notNull(),
  yourZipSales: integer("your_zip_sales").notNull().default(0),
  totalZipSales: integer("total_zip_sales").notNull().default(0),
  zipShare: real("zip_share"),
  yourYoyZipSales: integer("your_yoy_zip_sales"),
  yoyZipSales: integer("yoy_zip_sales"),
  yoyZipShare: real("yoy_zip_share"),
  zipYoyDelta: real("zip_yoy_delta"),
  spend: real("spend"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  zipRadiusIdx: uniqueIndex("geo_sales_zip_radius_idx").on(table.zip, table.radiusBand),
}));

// ============================================================================
// SALES TOTAL (Brand/Model Sales Data)
// ============================================================================

export const salesTotal = pgTable("sales_total", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  segment: text("segment"),
  model: text("model").notNull(),
  month: text("month").notNull(),
  unitsSold: integer("units_sold").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  brandModelMonthIdx: uniqueIndex("sales_total_brand_model_month_idx").on(table.brand, table.model, table.month),
}));

// ============================================================================
// SPYFU COMPETITORS
// ============================================================================

export const spyfuCompetitors = pgTable("spyfu_competitors", {
  id: serial("id").primaryKey(),
  domainName: text("domain_name").notNull().unique(),
  overlap: real("overlap"),
  commonKeywords: integer("common_keywords"),
  numberOfKeywords: integer("number_of_keywords"),
  monthlyClicks: integer("monthly_clicks"),
  monthlyValue: real("monthly_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  domainIdx: uniqueIndex("spyfu_competitors_domain_idx").on(table.domainName),
}));

// ============================================================================
// SPYFU BACKLINKS
// ============================================================================

export const spyfuBacklinks = pgTable("spyfu_backlinks", {
  id: serial("id").primaryKey(),
  backlink: text("backlink").notNull(),
  domain: text("domain").notNull(),
  domainStrength: integer("domain_strength"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  backlinkIdx: index("spyfu_backlinks_backlink_idx").on(table.backlink),
  domainIdx: index("spyfu_backlinks_domain_idx").on(table.domain),
}));

// ============================================================================
// SPYFU RANKING HISTORY
// ============================================================================

export const spyfuRankingHistory = pgTable("spyfu_ranking_history", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  keyword: text("keyword").notNull(),
  startRank: integer("start_rank"),
  endRank: integer("end_rank"),
  rankChange: integer("rank_change"),
  searchVolume: integer("search_volume"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  domainKeywordIdx: index("spyfu_ranking_history_domain_keyword_idx").on(table.domain, table.keyword),
}));

// ============================================================================
// SPYFU SEO KEYWORDS
// ============================================================================

export const spyfuSeoKeywords = pgTable("spyfu_seo_keywords", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  keyword: text("keyword").notNull(),
  rank: integer("rank"),
  topRank: integer("top_rank"),
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty"),
  topRankedUrl: text("top_ranked_url"),
  url: text("url"),
  totalMonthlyClicks: integer("total_monthly_clicks"),
  cpc: real("cpc"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  domainKeywordIdx: index("spyfu_seo_keywords_domain_keyword_idx").on(table.domain, table.keyword),
  searchVolumeIdx: index("spyfu_seo_keywords_search_volume_idx").on(table.searchVolume),
}));

// ============================================================================
// SPYFU SEO KOMBAT
// ============================================================================

export const spyfuSeoKombat = pgTable("spyfu_seo_kombat", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  keyword: text("keyword").notNull(),
  searchVolume: integer("search_volume"),
  totalClicks: integer("total_clicks"),
  isQuestion: text("is_question"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  domainKeywordIdx: index("spyfu_seo_kombat_domain_keyword_idx").on(table.domain, table.keyword),
}));

// ============================================================================
// SEO TOP PAGES
// ============================================================================

export const seoTopPages = pgTable("seo_top_pages", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  title: text("title"),
  url: text("url").notNull(),
  keyword: text("keyword"),
  rank: integer("rank"),
  searchVolume: integer("search_volume"),
  clicks: integer("clicks"),
  keywordCount: integer("keyword_count"),
  topKwClicks: integer("top_kw_clicks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  domainUrlIdx: index("seo_top_pages_domain_url_idx").on(table.domain, table.url),
}));

// ============================================================================
// CAMPAIGN SUMMARY
// ============================================================================

export const campaignSummary = pgTable("campaign_summary", {
  id: serial("id").primaryKey(),
  campaign: text("campaign").notNull(),
  device: text("device").notNull(),
  network: text("network").notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  cost: real("cost").notNull().default(0),
  conversions: real("conversions").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  campaignIdx: index("campaign_summary_campaign_idx").on(table.campaign),
}));

// ============================================================================
// GOOGLE SEARCH TERMS
// ============================================================================

export const googleSearchTerms = pgTable("google_search_terms", {
  id: serial("id").primaryKey(),
  searchTerm: text("search_term").notNull(),
  matchType: text("match_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  searchTermIdx: index("google_search_terms_search_term_idx").on(table.searchTerm),
}));

// ============================================================================
// MARKET INSIGHTS (AI-Generated Insights Cache)
// ============================================================================

export const marketInsights = pgTable("market_insights", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  context: text("context").notNull(),
  insight: text("insight").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  queryIdx: index("market_insights_query_idx").on(table.query),
  createdAtIdx: index("market_insights_created_at_idx").on(table.createdAt),
}));
