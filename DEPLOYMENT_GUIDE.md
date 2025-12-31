# 🚀 PRAETORIAN - Deployment Guide

## ✅ System Status

**Backend**: ✅ Running on http://localhost:5000
**Frontend**: ✅ Running on http://localhost:3000
**Database**: ✅ Initialized with 116 vehicles (20 VW + 96 Chevy)
**API**: ✅ All endpoints tested and working

## 📊 Test Results

### Database Ingestion
```
✅ Cherry Hill Volkswagen: 20 vehicles
   - Makes: 1 (Volkswagen)
   - Models: 2 (Jetta, Taos)
   - Avg Price: $27,674.70

✅ Midstate Chevrolet: 96 vehicles
   - Makes: 1 (Chevrolet)
   - Models: 8 (Trax, Blazer, Silverado, etc.)
   - Avg Price: $33,423.38
```

### API Endpoints Tested
- ✅ GET /api/health - Server health check
- ✅ GET /api/clients - List all clients
- ✅ GET /api/vehicles?client_id=1 - Get inventory
- ✅ GET /api/inventory/stats?client_id=1 - Get statistics
- ✅ POST /api/analysis/generate - Generate AI insights

### Sample AI Analysis Output
```json
{
  "inventory_gaps": [
    "Chevrolet Blazer",
    "Chevrolet Silverado 1500",
    "Chevrolet Trax",
    "Chevrolet Trailblazer"
  ],
  "seo_recommendations": [
    "Create model-specific landing pages for inventory gaps",
    "Optimize title tags with year, make, model, and location",
    "Add schema markup for vehicle listings"
  ],
  "sem_recommendations": [
    "Target competitor brand keywords with conquest campaigns",
    "Create dynamic search ads for inventory",
    "Use price extensions to highlight competitive pricing"
  ]
}
```

## 🎯 Access the Application

### Option 1: Local Development
1. **Backend**: Already running on port 5000
2. **Frontend**: Already running on port 3000
3. **Access**: Open http://localhost:3000 in your browser

### Option 2: Fresh Start
```bash
# Terminal 1 - Backend
cd /vercel/sandbox/backend
python3 api.py

# Terminal 2 - Frontend
cd /vercel/sandbox/frontend
npm run dev
```

## 🔐 Login Credentials

The system uses multi-tenant authentication. Select from:
- **Cherry Hill Volkswagen** (cherryhillvw)
- **Midstate Chevrolet** (midstatechevy)

## 📱 Dashboard Features

### Overview Tab
- **Stats Cards**: Total vehicles, makes, models, average price
- **Distribution Chart**: Interactive bar chart showing model counts

### Inventory Tab
- **Search**: Filter by make, model, VIN, or stock number
- **Table**: Paginated vehicle listings with images
- **Details**: VIN, stock, MSRP, dealer price, savings

### Insights Tab
- **Summary**: Inventory comparison metrics
- **Priority Actions**: Top 3 recommendations
- **Inventory Gaps**: Missing models vs competitors
- **SEO Recommendations**: 4 actionable SEO strategies
- **SEM Recommendations**: 4 PPC campaign ideas
- **Pricing Opportunities**: Competitive pricing analysis

## 🔧 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```bash
GET /api/health
```

#### Get All Clients
```bash
GET /api/clients

Response:
{
  "success": true,
  "clients": [
    {
      "id": 1,
      "name": "Cherry Hill Volkswagen",
      "subdomain": "cherryhillvw",
      "dealer_name": "Cherry Hill VW"
    }
  ]
}
```

#### Get Vehicles
```bash
GET /api/vehicles?client_id=1

Optional filters:
- make=Volkswagen
- model=Jetta
- year=2026

Response:
{
  "success": true,
  "count": 20,
  "vehicles": [...]
}
```

#### Get Inventory Stats
```bash
GET /api/inventory/stats?client_id=1

Response:
{
  "success": true,
  "stats": {
    "total_vehicles": 20,
    "total_makes": 1,
    "total_models": 2,
    "avg_price": 27674.70
  }
}
```

#### Get Model Distribution
```bash
GET /api/inventory/distribution?client_id=1

Response:
{
  "success": true,
  "distribution": [
    {"make": "Volkswagen", "model": "Jetta", "count": 10},
    {"make": "Volkswagen", "model": "Taos", "count": 10}
  ]
}
```

#### Generate AI Analysis
```bash
POST /api/analysis/generate
Content-Type: application/json

{
  "client_id": 1,
  "competitor_ids": [2]
}

Response:
{
  "success": true,
  "analysis_id": 1,
  "insights": {
    "summary": {...},
    "inventory_gaps": [...],
    "seo_recommendations": [...],
    "sem_recommendations": [...],
    "pricing_opportunities": [...]
  }
}
```

#### Get Latest Analysis
```bash
GET /api/analysis/latest?client_id=1
```

#### Ingest New Data
```bash
POST /api/ingest
Content-Type: application/json

{
  "client_id": 1,
  "dealer_name": "Cherry Hill VW",
  "records": [
    {
      "title-top": "New 2026",
      "title-bottom": "Volkswagen Jetta S",
      "vin-row": "VIN: 3VW5W7BU7TM025117",
      "price": "$25,791",
      "strong_2": "$25,291"
    }
  ]
}
```

## 📂 Project Structure

```
/vercel/sandbox/
├── backend/
│   ├── database.py          # SQLite schema & ORM
│   ├── normalizer.py        # JSON parser
│   ├── ingest.py            # Data pipeline
│   ├── api.py               # Flask REST API
│   ├── requirements.txt     # Python dependencies
│   └── praetorian.db        # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app
│   │   └── index.css        # Tailwind styles
│   ├── package.json
│   └── vite.config.js
├── uploads/
│   ├── simplescraper-www-cherryhillvw-com-*.json
│   └── simplescraper-www-midstatechevy-com-*.json
└── README_PRAETORIAN.md
```

## 🔄 Data Flow

1. **Scraping** → Thunderbit/Browse AI scrapes DealerInspire sites
2. **Upload** → JSON files placed in `/uploads` directory
3. **Normalization** → `normalizer.py` parses inconsistent formats
4. **Ingestion** → `ingest.py` loads into SQLite with deduplication
5. **API** → Flask serves data to frontend
6. **Dashboard** → React displays real-time inventory
7. **Analysis** → AI engine generates competitive insights

## 🧪 Testing Checklist

- [x] Database initialization
- [x] Data normalization (116 vehicles)
- [x] Data ingestion (Cherry Hill VW + Midstate Chevy)
- [x] API health check
- [x] Client listing endpoint
- [x] Vehicle inventory endpoint
- [x] Statistics endpoint
- [x] AI analysis generation
- [x] Frontend server startup
- [x] React app rendering

## 🚀 Production Deployment

### Backend (Python/Flask)
**Recommended**: AWS Elastic Beanstalk, Heroku, or Railway

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

**Environment Variables**:
```
DATABASE_URL=postgresql://...  # Replace SQLite with PostgreSQL
FLASK_ENV=production
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (React/Vite)
**Recommended**: Vercel, Netlify, or Cloudflare Pages

```bash
# Build for production
npm run build

# Output: dist/ directory
```

**Environment Variables**:
```
VITE_API_BASE=https://api.yourdomain.com
```

### Database
**Recommended**: PostgreSQL on AWS RDS, Supabase, or Neon

```sql
-- Migrate from SQLite to PostgreSQL
-- Use pgloader or manual export/import
```

## 💰 Cost Estimate (Production)

### No-Code Stack (As Specified)
- **Xano** (Backend/DB): $99-199/mo
- **WeWeb** (Frontend): $49-99/mo
- **Thunderbit Pro** (Scraping): $99/mo
- **Zapier/Make** (Automation): $29-99/mo
- **Total**: ~$276-496/mo

### Code Stack (Current Implementation)
- **Backend**: Railway/Heroku ($5-25/mo)
- **Frontend**: Vercel/Netlify (Free-$20/mo)
- **Database**: Supabase/Neon (Free-$25/mo)
- **Scraping**: Bright Data/ScraperAPI ($50-100/mo)
- **Total**: ~$55-170/mo

## 🔐 Security Considerations

### For Production:
1. **Authentication**: Implement JWT tokens or OAuth2
2. **API Keys**: Add API key authentication
3. **Rate Limiting**: Prevent abuse
4. **HTTPS**: Use SSL certificates
5. **Environment Variables**: Never commit secrets
6. **Input Validation**: Sanitize all inputs
7. **SQL Injection**: Use parameterized queries (already done)
8. **CORS**: Restrict to specific domains

## 📈 Scaling Considerations

### Database
- Migrate from SQLite to PostgreSQL
- Add read replicas for heavy queries
- Implement caching (Redis)

### API
- Use load balancer (AWS ALB, Nginx)
- Horizontal scaling with multiple instances
- Add CDN for static assets

### Frontend
- Enable CDN caching
- Implement code splitting
- Optimize images and assets

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if API is running
curl http://localhost:5000/api/health

# View logs
tail -f /tmp/api.log

# Restart API
pkill -f "python3 api.py"
cd backend && python3 api.py &
```

### Frontend Issues
```bash
# Check if frontend is running
curl http://localhost:3000

# Restart frontend
pkill -f "npm run dev"
cd frontend && npm run dev &
```

### Database Issues
```bash
# Reset database
rm backend/praetorian.db
python3 backend/database.py
python3 backend/ingest.py
```

## 📞 Support

For issues or questions:
1. Check logs: `/tmp/api.log`
2. Verify ports: `lsof -i :5000` and `lsof -i :3000`
3. Review README_PRAETORIAN.md for detailed documentation

## ✅ Next Steps

1. **Test the Dashboard**: Open http://localhost:3000
2. **Login**: Select a dealership
3. **Explore**: Navigate through Overview, Inventory, and Insights tabs
4. **Generate Analysis**: Click "Generate New Analysis" in Insights tab
5. **Review Data**: Check vehicle listings and competitive intelligence

---

**Status**: ✅ Fully Operational
**Last Updated**: December 31, 2025
**Version**: 1.0.0 (Prototype)
