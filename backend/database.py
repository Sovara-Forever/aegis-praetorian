#!/usr/bin/env python3
"""
database.py - Praetorian Multi-Tenant Database Schema
SQLite database with normalized vehicle inventory and competitive intelligence
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from contextlib import contextmanager

DB_PATH = Path(__file__).parent / "praetorian.db"


class PraetorianDB:
    """Multi-tenant automotive competitive intelligence database"""
    
    def __init__(self, db_path: str = str(DB_PATH)):
        self.db_path = db_path
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def init_database(self):
        """Initialize database schema with all tables and indexes"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Clients table (multi-tenant)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS clients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    subdomain TEXT UNIQUE NOT NULL,
                    dealer_name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Vehicles table (normalized inventory)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vehicles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id INTEGER NOT NULL,
                    vin TEXT NOT NULL,
                    stock_number TEXT,
                    year INTEGER NOT NULL,
                    make TEXT NOT NULL,
                    model TEXT NOT NULL,
                    trim TEXT,
                    condition TEXT DEFAULT 'New',
                    msrp REAL,
                    dealer_price REAL,
                    savings REAL,
                    image_url TEXT,
                    detail_url TEXT,
                    features_json TEXT,
                    dealer_name TEXT,
                    status TEXT DEFAULT 'In Stock',
                    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (client_id) REFERENCES clients(id),
                    UNIQUE(client_id, vin)
                )
            """)
            
            # Competitive analysis results
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS competitive_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id INTEGER NOT NULL,
                    competitor_ids TEXT NOT NULL,
                    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    insights_json TEXT NOT NULL,
                    recommendations_json TEXT,
                    FOREIGN KEY (client_id) REFERENCES clients(id)
                )
            """)
            
            # Geographic sales data
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS geo_sales (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    zip_code TEXT NOT NULL,
                    dealer_name TEXT NOT NULL,
                    sales_count INTEGER DEFAULT 0,
                    model TEXT,
                    distance_miles INTEGER,
                    period TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Performance indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_vehicles_client ON vehicles(client_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model, year)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(dealer_price)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_geo_zip ON geo_sales(zip_code)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_analysis_client ON competitive_analysis(client_id)")
            
            conn.commit()
    
    def create_client(self, name: str, subdomain: str, dealer_name: str = None) -> int:
        """Create a new client"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO clients (name, subdomain, dealer_name) VALUES (?, ?, ?)",
                (name, subdomain, dealer_name)
            )
            return cursor.lastrowid
    
    def get_client(self, subdomain: str) -> Optional[Dict]:
        """Get client by subdomain"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM clients WHERE subdomain = ?", (subdomain,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_all_clients(self) -> List[Dict]:
        """Get all clients"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM clients ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
    
    def upsert_vehicle(self, vehicle_data: Dict) -> int:
        """Insert or update vehicle (upsert by client_id + VIN)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Check if exists
            cursor.execute(
                "SELECT id FROM vehicles WHERE client_id = ? AND vin = ?",
                (vehicle_data['client_id'], vehicle_data['vin'])
            )
            existing = cursor.fetchone()
            
            if existing:
                # Update
                cursor.execute("""
                    UPDATE vehicles SET
                        stock_number = ?, year = ?, make = ?, model = ?, trim = ?,
                        condition = ?, msrp = ?, dealer_price = ?, savings = ?,
                        image_url = ?, detail_url = ?, features_json = ?,
                        dealer_name = ?, status = ?, scraped_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (
                    vehicle_data.get('stock_number'),
                    vehicle_data['year'],
                    vehicle_data['make'],
                    vehicle_data['model'],
                    vehicle_data.get('trim'),
                    vehicle_data.get('condition', 'New'),
                    vehicle_data.get('msrp'),
                    vehicle_data.get('dealer_price'),
                    vehicle_data.get('savings'),
                    vehicle_data.get('image_url'),
                    vehicle_data.get('detail_url'),
                    vehicle_data.get('features_json'),
                    vehicle_data.get('dealer_name'),
                    vehicle_data.get('status', 'In Stock'),
                    existing['id']
                ))
                return existing['id']
            else:
                # Insert
                cursor.execute("""
                    INSERT INTO vehicles (
                        client_id, vin, stock_number, year, make, model, trim,
                        condition, msrp, dealer_price, savings, image_url, detail_url,
                        features_json, dealer_name, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    vehicle_data['client_id'],
                    vehicle_data['vin'],
                    vehicle_data.get('stock_number'),
                    vehicle_data['year'],
                    vehicle_data['make'],
                    vehicle_data['model'],
                    vehicle_data.get('trim'),
                    vehicle_data.get('condition', 'New'),
                    vehicle_data.get('msrp'),
                    vehicle_data.get('dealer_price'),
                    vehicle_data.get('savings'),
                    vehicle_data.get('image_url'),
                    vehicle_data.get('detail_url'),
                    vehicle_data.get('features_json'),
                    vehicle_data.get('dealer_name'),
                    vehicle_data.get('status', 'In Stock')
                ))
                return cursor.lastrowid
    
    def get_vehicles(self, client_id: int, filters: Dict = None) -> List[Dict]:
        """Get vehicles for a client with optional filters"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = "SELECT * FROM vehicles WHERE client_id = ?"
            params = [client_id]
            
            if filters:
                if filters.get('make'):
                    query += " AND make = ?"
                    params.append(filters['make'])
                if filters.get('model'):
                    query += " AND model = ?"
                    params.append(filters['model'])
                if filters.get('year'):
                    query += " AND year = ?"
                    params.append(filters['year'])
            
            query += " ORDER BY year DESC, make, model"
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_inventory_stats(self, client_id: int) -> Dict:
        """Get inventory statistics for a client"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_vehicles,
                    COUNT(DISTINCT make) as total_makes,
                    COUNT(DISTINCT model) as total_models,
                    AVG(dealer_price) as avg_price,
                    MIN(dealer_price) as min_price,
                    MAX(dealer_price) as max_price
                FROM vehicles
                WHERE client_id = ?
            """, (client_id,))
            
            return dict(cursor.fetchone())
    
    def get_model_distribution(self, client_id: int) -> List[Dict]:
        """Get vehicle count by model"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT make, model, COUNT(*) as count
                FROM vehicles
                WHERE client_id = ?
                GROUP BY make, model
                ORDER BY count DESC
            """, (client_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    def save_analysis(self, client_id: int, competitor_ids: List[int], 
                     insights: Dict, recommendations: Dict) -> int:
        """Save competitive analysis results"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO competitive_analysis 
                (client_id, competitor_ids, insights_json, recommendations_json)
                VALUES (?, ?, ?, ?)
            """, (
                client_id,
                json.dumps(competitor_ids),
                json.dumps(insights),
                json.dumps(recommendations)
            ))
            return cursor.lastrowid
    
    def get_latest_analysis(self, client_id: int) -> Optional[Dict]:
        """Get most recent analysis for a client"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM competitive_analysis
                WHERE client_id = ?
                ORDER BY analysis_date DESC
                LIMIT 1
            """, (client_id,))
            row = cursor.fetchone()
            if row:
                result = dict(row)
                result['insights_json'] = json.loads(result['insights_json'])
                if result['recommendations_json']:
                    result['recommendations_json'] = json.loads(result['recommendations_json'])
                return result
            return None


def init_sample_data():
    """Initialize database with sample clients"""
    db = PraetorianDB()
    
    # Check if clients already exist
    clients = db.get_all_clients()
    if len(clients) > 0:
        print(f"✓ Database already initialized with {len(clients)} clients")
        return
    
    # Create sample clients
    cherry_hill_id = db.create_client(
        name="Cherry Hill Volkswagen",
        subdomain="cherryhillvw",
        dealer_name="Cherry Hill VW"
    )
    
    midstate_id = db.create_client(
        name="Midstate Chevrolet",
        subdomain="midstatechevy",
        dealer_name="Midstate Chevy"
    )
    
    print(f"✓ Created clients: Cherry Hill VW (ID: {cherry_hill_id}), Midstate Chevy (ID: {midstate_id})")


if __name__ == "__main__":
    print("🚀 Initializing Praetorian Database...")
    init_sample_data()
    print("✅ Database ready!")
