#!/usr/bin/env python3
"""
api.py - Praetorian REST API
Flask-based API for vehicle inventory and competitive analysis
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from database import PraetorianDB
from normalizer import DealerInspireNormalizer
import json
from pathlib import Path
from typing import Dict, List

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize database
db = PraetorianDB()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Praetorian API'})


@app.route('/api/clients', methods=['GET'])
def get_clients():
    """Get all clients"""
    try:
        clients = db.get_all_clients()
        return jsonify({'success': True, 'clients': clients})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/clients/<subdomain>', methods=['GET'])
def get_client(subdomain):
    """Get client by subdomain"""
    try:
        client = db.get_client(subdomain)
        if client:
            return jsonify({'success': True, 'client': client})
        else:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    """Get vehicles for a client with optional filters"""
    try:
        client_id = request.args.get('client_id', type=int)
        if not client_id:
            return jsonify({'success': False, 'error': 'client_id required'}), 400
        
        # Optional filters
        filters = {}
        if request.args.get('make'):
            filters['make'] = request.args.get('make')
        if request.args.get('model'):
            filters['model'] = request.args.get('model')
        if request.args.get('year'):
            filters['year'] = request.args.get('year', type=int)
        
        vehicles = db.get_vehicles(client_id, filters)
        
        # Parse features_json for each vehicle
        for vehicle in vehicles:
            if vehicle.get('features_json'):
                try:
                    vehicle['features'] = json.loads(vehicle['features_json'])
                except:
                    vehicle['features'] = []
            else:
                vehicle['features'] = []
        
        return jsonify({'success': True, 'vehicles': vehicles, 'count': len(vehicles)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/inventory/stats', methods=['GET'])
def get_inventory_stats():
    """Get inventory statistics for a client"""
    try:
        client_id = request.args.get('client_id', type=int)
        if not client_id:
            return jsonify({'success': False, 'error': 'client_id required'}), 400
        
        stats = db.get_inventory_stats(client_id)
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/inventory/distribution', methods=['GET'])
def get_model_distribution():
    """Get model distribution for a client"""
    try:
        client_id = request.args.get('client_id', type=int)
        if not client_id:
            return jsonify({'success': False, 'error': 'client_id required'}), 400
        
        distribution = db.get_model_distribution(client_id)
        return jsonify({'success': True, 'distribution': distribution})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/compare', methods=['GET'])
def compare_inventory():
    """Compare client inventory with competitors"""
    try:
        client_id = request.args.get('client_id', type=int)
        competitor_ids_str = request.args.get('competitor_ids', '')
        
        if not client_id:
            return jsonify({'success': False, 'error': 'client_id required'}), 400
        
        # Parse competitor IDs
        competitor_ids = []
        if competitor_ids_str:
            competitor_ids = [int(x.strip()) for x in competitor_ids_str.split(',') if x.strip()]
        
        # Get client data
        client = db.get_client_by_id(client_id)
        client_vehicles = db.get_vehicles(client_id)
        client_distribution = db.get_model_distribution(client_id)
        
        # Get competitor data
        competitors_data = []
        for comp_id in competitor_ids:
            comp_vehicles = db.get_vehicles(comp_id)
            comp_distribution = db.get_model_distribution(comp_id)
            comp_client = db.get_client_by_id(comp_id)
            
            competitors_data.append({
                'client': comp_client,
                'vehicle_count': len(comp_vehicles),
                'distribution': comp_distribution,
                'vehicles': comp_vehicles
            })
        
        # Build comparison
        comparison = {
            'client': {
                'info': client,
                'vehicle_count': len(client_vehicles),
                'distribution': client_distribution,
                'vehicles': client_vehicles
            },
            'competitors': competitors_data
        }
        
        return jsonify({'success': True, 'comparison': comparison})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ingest', methods=['POST'])
def ingest_data():
    """Ingest scraped JSON data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        client_id = data.get('client_id')
        dealer_name = data.get('dealer_name')
        records = data.get('records', [])
        
        if not client_id or not records:
            return jsonify({'success': False, 'error': 'client_id and records required'}), 400
        
        # Normalize and insert records
        count = 0
        errors = []
        
        for record in records:
            try:
                normalized = DealerInspireNormalizer.normalize_record(record, dealer_name)
                normalized['client_id'] = client_id
                
                if normalized.get('vin') and normalized.get('year') and normalized.get('make'):
                    db.upsert_vehicle(normalized)
                    count += 1
                else:
                    errors.append(f"Missing required fields in record")
            except Exception as e:
                errors.append(str(e))
        
        return jsonify({
            'success': True,
            'ingested': count,
            'errors': errors if errors else None
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/analysis/latest', methods=['GET'])
def get_latest_analysis():
    """Get latest competitive analysis for a client"""
    try:
        client_id = request.args.get('client_id', type=int)
        if not client_id:
            return jsonify({'success': False, 'error': 'client_id required'}), 400
        
        analysis = db.get_latest_analysis(client_id)
        if analysis:
            return jsonify({'success': True, 'analysis': analysis})
        else:
            return jsonify({'success': False, 'error': 'No analysis found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/analysis/generate', methods=['POST'])
def generate_analysis():
    """Generate competitive analysis using AI"""
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        competitor_ids = data.get('competitor_ids', [])
        
        if not client_id:
            return jsonify({'success': False, 'error': 'client_id required'}), 400
        
        # Get comparison data
        client_vehicles = db.get_vehicles(client_id)
        client_distribution = db.get_model_distribution(client_id)
        
        competitors_data = []
        for comp_id in competitor_ids:
            comp_vehicles = db.get_vehicles(comp_id)
            comp_distribution = db.get_model_distribution(comp_id)
            competitors_data.append({
                'id': comp_id,
                'vehicles': comp_vehicles,
                'distribution': comp_distribution
            })
        
        # Generate insights (simplified - would call AI API in production)
        insights = generate_competitive_insights(
            client_vehicles, 
            client_distribution,
            competitors_data
        )
        
        # Save analysis
        analysis_id = db.save_analysis(
            client_id,
            competitor_ids,
            insights,
            insights.get('recommendations', {})
        )
        
        return jsonify({
            'success': True,
            'analysis_id': analysis_id,
            'insights': insights
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


def generate_competitive_insights(client_vehicles: List[Dict], 
                                  client_distribution: List[Dict],
                                  competitors_data: List[Dict]) -> Dict:
    """
    Generate competitive insights (simplified version)
    In production, this would call Claude/GPT API
    """
    insights = {
        'summary': {},
        'inventory_gaps': [],
        'pricing_opportunities': [],
        'seo_recommendations': [],
        'sem_recommendations': []
    }
    
    # Calculate summary
    client_count = len(client_vehicles)
    competitor_total = sum(len(c['vehicles']) for c in competitors_data)
    
    insights['summary'] = {
        'client_inventory_count': client_count,
        'competitor_total_inventory': competitor_total,
        'inventory_advantage': client_count > (competitor_total / len(competitors_data)) if competitors_data else True
    }
    
    # Find inventory gaps
    client_models = {f"{v['make']} {v['model']}" for v in client_vehicles}
    competitor_models = set()
    for comp in competitors_data:
        for v in comp['vehicles']:
            competitor_models.add(f"{v['make']} {v['model']}")
    
    gaps = competitor_models - client_models
    insights['inventory_gaps'] = list(gaps)[:5]  # Top 5 gaps
    
    # Pricing opportunities
    if client_vehicles:
        avg_client_price = sum(v.get('dealer_price', 0) for v in client_vehicles if v.get('dealer_price')) / len(client_vehicles)
        insights['pricing_opportunities'] = [
            f"Average inventory price: ${avg_client_price:,.2f}",
            "Consider competitive pricing analysis for high-volume models"
        ]
    
    # SEO recommendations
    insights['seo_recommendations'] = [
        "Create model-specific landing pages for inventory gaps",
        "Optimize title tags with year, make, model, and location",
        "Add schema markup for vehicle listings",
        "Build content around conquest keywords"
    ]
    
    # SEM recommendations
    insights['sem_recommendations'] = [
        "Target competitor brand keywords with conquest campaigns",
        "Create dynamic search ads for inventory",
        "Use price extensions to highlight competitive pricing",
        "Implement remarketing for vehicle detail page visitors"
    ]
    
    insights['recommendations'] = {
        'priority_actions': [
            f"Stock {len(gaps)} missing models to match competitor offerings",
            "Launch conquest SEM campaigns targeting competitor brands",
            "Optimize SEO for high-volume vehicle searches"
        ]
    }
    
    return insights


# Helper method for get_client_by_id
def get_client_by_id_helper(client_id: int):
    """Get client by ID (helper for comparison endpoint)"""
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM clients WHERE id = ?", (client_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

# Monkey patch the method
db.get_client_by_id = get_client_by_id_helper


if __name__ == '__main__':
    print("🚀 Starting Praetorian API Server...")
    print("📡 API available at: http://localhost:5000")
    print("📚 Endpoints:")
    print("   GET  /api/health")
    print("   GET  /api/clients")
    print("   GET  /api/vehicles?client_id=X")
    print("   GET  /api/inventory/stats?client_id=X")
    print("   GET  /api/compare?client_id=X&competitor_ids=Y,Z")
    print("   POST /api/ingest")
    print("   POST /api/analysis/generate")
    app.run(host='0.0.0.0', port=5000, debug=True)
