import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, vehicles } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data, schemaType } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    let insertedCount = 0;

    // Handle different schema types
    if (schemaType === "inventory_vehicle") {
      // Process vehicle data
      for (const row of data) {
        try {
          // Normalize and insert vehicle data
          const vehicleData = {
            vin: row.vin || row["vehicle-identifiers__value"] || row["vin-row"],
            year: parseInt(row.year || row["vehicle-title__year"] || row["title-top"]) || new Date().getFullYear(),
            make: row.make || extractMake(row["vehicle-title__make-model"] || row["title-bottom"]),
            model: row.model || extractModel(row["vehicle-title__make-model"] || row["title-bottom"]),
            trim: row.trim || row["vehicle-title__trim"] || null,
            stockNumber: row.stock_number || row["vehicle-identifiers__value 2"] || row["stock-row"] || null,
            price: parseFloat(row.price || row["vehiclePricingHighlightAmount 2"] || row["price 3"]) || null,
            msrp: parseFloat(row.msrp || row["price"]) || null,
            savings: parseFloat(row.savings || row["vehiclePricingHighlightAmount"] || row["price 2"]) || null,
            mileage: parseInt(row.mileage) || null,
            exteriorColor: row.exterior_color || null,
            interiorColor: row.interior_color || row["vehicle-colors__label 2"] || null,
            transmission: row.transmission || null,
            drivetrain: row.drivetrain || null,
            engine: row.engine || null,
            fuelType: row.fuel_type || null,
            status: row.status || row["vehicle-status__label"] || null,
            dealer: row.dealer || null,
            location: row.location || null,
            url: row.url || row["hero-carousel__item--viewvehicle href"] || row["hit-link href"] || null,
            imageUrl: row.image_url || row["hero-carousel__background-image src"] || row["hit-link src"] || null,
            features: row.features || null,
            scrapedDate: new Date(row.scraped_date || Date.now()),
          };

          // Skip if VIN is missing
          if (!vehicleData.vin) continue;

          // Upsert vehicle (insert or update if VIN exists)
          await db
            .insert(vehicles)
            .values(vehicleData)
            .onConflictDoUpdate({
              target: vehicles.vin,
              set: {
                ...vehicleData,
                updatedAt: new Date(),
              },
            });

          insertedCount++;
        } catch (error) {
          console.error("Error inserting vehicle:", error);
          // Continue with next row
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${insertedCount} records`,
      insertedCount,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}

function extractMake(combined: string | null): string | null {
  if (!combined) return null;
  const parts = combined.trim().split(" ");
  return parts[0] || null;
}

function extractModel(combined: string | null): string | null {
  if (!combined) return null;
  const parts = combined.trim().split(" ");
  return parts.slice(1).join(" ") || null;
}
