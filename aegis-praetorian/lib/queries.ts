import { db, vehicles, adsDaily, geoSales, salesTotal } from "./db";
import { sql, desc, count, avg, sum } from "drizzle-orm";

export async function getMarketOverview() {
  try {
    // Get total vehicles
    const totalVehiclesResult = await db
      .select({ count: count() })
      .from(vehicles);
    const totalVehicles = totalVehiclesResult[0]?.count || 0;

    // Get average price
    const avgPriceResult = await db
      .select({ avg: avg(vehicles.price) })
      .from(vehicles);
    const averagePrice = avgPriceResult[0]?.avg || 0;

    // Get dealer count
    const dealerCountResult = await db
      .select({ count: sql<number>`count(distinct ${vehicles.dealer})` })
      .from(vehicles);
    const dealerCount = dealerCountResult[0]?.count || 0;

    // Get top makes
    const topMakes = await db
      .select({
        make: vehicles.make,
        count: count(),
      })
      .from(vehicles)
      .groupBy(vehicles.make)
      .orderBy(desc(count()))
      .limit(5);

    // Get top models
    const topModels = await db
      .select({
        model: vehicles.model,
        make: vehicles.make,
        count: count(),
      })
      .from(vehicles)
      .groupBy(vehicles.model, vehicles.make)
      .orderBy(desc(count()))
      .limit(5);

    // Get price distribution
    const priceRanges = await db.execute(sql`
      SELECT 
        CASE 
          WHEN price < 20000 THEN 'Under $20k'
          WHEN price >= 20000 AND price < 40000 THEN '$20k-$40k'
          WHEN price >= 40000 AND price < 60000 THEN '$40k-$60k'
          WHEN price >= 60000 AND price < 80000 THEN '$60k-$80k'
          ELSE 'Over $80k'
        END as range,
        COUNT(*) as count
      FROM ${vehicles}
      WHERE price IS NOT NULL
      GROUP BY range
      ORDER BY MIN(price)
    `);

    return {
      totalVehicles,
      averagePrice: Number(averagePrice),
      dealerCount,
      topMakes: topMakes.map((m) => ({
        make: m.make || "Unknown",
        count: m.count,
      })),
      topModels: topModels.map((m) => ({
        model: m.model,
        make: m.make || "Unknown",
        count: m.count,
      })),
      priceDistribution: priceRanges.rows as Array<{ range: string; count: number }>,
    };
  } catch (error) {
    console.error("Error fetching market overview:", error);
    return {
      totalVehicles: 0,
      averagePrice: 0,
      dealerCount: 0,
      topMakes: [],
      topModels: [],
      priceDistribution: [],
    };
  }
}

export async function getDealerStats() {
  try {
    const stats = await db
      .select({
        dealer: vehicles.dealer,
        totalInventory: count(),
        avgPrice: avg(vehicles.price),
      })
      .from(vehicles)
      .groupBy(vehicles.dealer)
      .orderBy(desc(count()))
      .limit(10);

    return stats.map((s) => ({
      dealer: s.dealer || "Unknown",
      totalInventory: s.totalInventory,
      avgPrice: Number(s.avgPrice) || 0,
    }));
  } catch (error) {
    console.error("Error fetching dealer stats:", error);
    return [];
  }
}

export async function getRecentVehicles(limit: number = 10) {
  try {
    return await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching recent vehicles:", error);
    return [];
  }
}
