#!/usr/bin/env python3
"""
ingest.py - Data Ingestion Pipeline
Loads scraped JSON files, normalizes them, and stores in database
"""

import sys
from pathlib import Path
from typing import List, Dict
from database import PraetorianDB
from normalizer import DealerInspireNormalizer


def ingest_json_file(db: PraetorianDB, json_path: Path, client_subdomain: str) -> int:
    """
    Ingest a JSON file for a specific client
    
    Args:
        db: Database instance
        json_path: Path to JSON file
        client_subdomain: Client subdomain to associate vehicles with
    
    Returns:
        Number of vehicles ingested
    """
    # Get client
    client = db.get_client(client_subdomain)
    if not client:
        print(f"❌ Client not found: {client_subdomain}")
        return 0
    
    client_id = client['id']
    
    # Normalize the JSON file
    print(f"📄 Processing: {json_path.name}")
    normalized_records = DealerInspireNormalizer.normalize_file(json_path)
    
    if not normalized_records:
        print(f"⚠️  No valid records found in {json_path.name}")
        return 0
    
    # Insert into database
    count = 0
    for record in normalized_records:
        try:
            record['client_id'] = client_id
            db.upsert_vehicle(record)
            count += 1
        except Exception as e:
            print(f"⚠️  Error inserting vehicle {record.get('vin')}: {e}")
            continue
    
    print(f"✅ Ingested {count} vehicles for {client['name']}")
    return count


def ingest_all_uploads(db: PraetorianDB) -> Dict[str, int]:
    """Ingest all JSON files from uploads directory"""
    uploads_dir = Path(__file__).parent.parent / "uploads"
    
    if not uploads_dir.exists():
        print(f"❌ Uploads directory not found: {uploads_dir}")
        return {}
    
    results = {}
    
    # Map files to clients
    file_mappings = [
        {
            'file': 'simplescraper-www-cherryhillvw-com-2025-12-31T12-05-01.json',
            'subdomain': 'cherryhillvw'
        },
        {
            'file': 'simplescraper-www-midstatechevy-com-2025-12-31T12-10-37.json',
            'subdomain': 'midstatechevy'
        }
    ]
    
    for mapping in file_mappings:
        file_path = uploads_dir / mapping['file']
        if file_path.exists():
            count = ingest_json_file(db, file_path, mapping['subdomain'])
            results[mapping['subdomain']] = count
        else:
            print(f"⚠️  File not found: {mapping['file']}")
    
    return results


def main():
    """Main ingestion pipeline"""
    print("🚀 PRAETORIAN INGESTION PIPELINE")
    print("=" * 60)
    
    # Initialize database
    db = PraetorianDB()
    
    # Ingest all files
    results = ingest_all_uploads(db)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 INGESTION SUMMARY")
    total = sum(results.values())
    for subdomain, count in results.items():
        print(f"   {subdomain}: {count} vehicles")
    print(f"\n✅ Total: {total} vehicles ingested")
    
    # Show stats
    print("\n📈 INVENTORY STATISTICS")
    for subdomain in results.keys():
        client = db.get_client(subdomain)
        if client:
            stats = db.get_inventory_stats(client['id'])
            print(f"\n   {client['name']}:")
            print(f"      Total Vehicles: {stats['total_vehicles']}")
            print(f"      Makes: {stats['total_makes']}")
            print(f"      Models: {stats['total_models']}")
            if stats['avg_price']:
                print(f"      Avg Price: ${stats['avg_price']:,.2f}")


if __name__ == "__main__":
    main()
