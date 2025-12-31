# 🎯 PRAETORIAN - Automotive Intelligence Platform

A multi-tenant competitive intelligence system for automotive dealerships with real-time inventory tracking, AI-powered insights, and comprehensive analytics.

## 🏗️ Architecture

### Tech Stack
- **Backend**: Python 3.11 + Flask + SQLite
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Charts**: ApexCharts
- **Database**: SQLite (multi-tenant schema)

### Components

#### 1. Data Layer (`backend/`)
- **database.py**: Multi-tenant SQLite schema with normalized vehicle inventory
- **normalizer.py**: DealerInspire JSON parser with intelligent field mapping
- **ingest.py**: Data ingestion pipeline with deduplication

#### 2. API Layer (`backend/api.py`)
- REST API with CORS support
- Endpoints for inventory, stats, comparison, and AI analysis
- Real-time data synchronization

#### 3. Frontend (`frontend/`)
- **Login**: Multi-tenant authentication
- **Dashboard**: Real-time inventory overview
- **Charts**: ApexCharts for model distribution
- **Tables**: Searchable, paginated vehicle listings
- **Insights**: AI-generated competitive intelligence

## 📊 Features

### ✅ Implemented
1. **Multi-Tenant Database**
   - Client isolation with `client_id`
   - Normalized vehicle schema
   - Performance indexes

2. **Data Normalization**
   - Handles multiple DealerInspire formats
   - Extracts: VIN, stock, year, make, model, trim, pricing, images
   - Automatic field mapping

3. **REST API**
   - `/api/clients` - Get all clients
   - `/api/vehicles?client_id=X` - Get inventory
   - `/api/inventory/stats` - Get statistics
   - `/api/inventory/distribution` - Model distribution
   - `/api/compare` - Competitive comparison
   - `/api/analysis/generate` - AI insights
   - `/api/ingest` - Upload scraped data

4. **Dashboard**
   - Inventory statistics cards
   - Model distribution charts (ApexCharts)
   - Searchable vehicle table with pagination
   - Competitive insights panel

5. **AI Analysis Engine**
   - Inventory gap detection
   - Pricing opportunity identification
   - SEO recommendations
   - SEM/PPC campaign suggestions
   - Priority action items

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- pip and npm

### Installation

```bash
# Run setup script
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
# Backend
cd backend
pip3 install -r requirements.txt
python3 database.py  # Initialize DB
python3 ingest.py    # Load sample data

# Frontend
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
python3 api.py
# API runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Dashboard runs on http://localhost:3000
```

### Access
1. Open http://localhost:3000
2. Select a dealership (Cherry Hill VW or Midstate Chevy)
3. Explore dashboard tabs: Overview, Inventory, Insights

## 📁 Project Structure

```
/vercel/sandbox/
├── backend/
│   ├── database.py          # Database schema & ORM
│   ├── normalizer.py        # JSON parser
│   ├── ingest.py            # Data pipeline
│   ├── api.py               # Flask REST API
│   ├── requirements.txt     # Python deps
│   └── praetorian.db        # SQLite database (generated)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InventoryStats.jsx
│   │   │   ├── ModelDistribution.jsx
│   │   │   ├── VehicleTable.jsx
│   │   │   └── CompetitiveInsights.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── uploads/
│   ├── simplescraper-www-cherryhillvw-com-*.json
│   └── simplescraper-www-midstatechevy-com-*.json
├── setup.sh
└── README_PRAETORIAN.md
```

## 🔧 API Endpoints

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/<subdomain>` - Get client by subdomain

### Inventory
- `GET /api/vehicles?client_id=X` - Get vehicles (with filters)
- `GET /api/inventory/stats?client_id=X` - Get statistics
- `GET /api/inventory/distribution?client_id=X` - Model distribution

### Analysis
- `GET /api/compare?client_id=X&competitor_ids=Y,Z` - Compare inventories
- `POST /api/analysis/generate` - Generate AI insights
- `GET /api/analysis/latest?client_id=X` - Get latest analysis

### Data Ingestion
- `POST /api/ingest` - Upload scraped JSON data

## 🎨 Dashboard Features

### Overview Tab
- **Stats Cards**: Total vehicles, makes, models, avg price
- **Distribution Chart**: Horizontal bar chart of model counts

### Inventory Tab
- **Search**: Filter by make, model, VIN, stock
- **Table**: Paginated vehicle listings with images
- **Details**: VIN, stock, MSRP, dealer price, savings

### Insights Tab
- **Summary**: Inventory comparison metrics
- **Priority Actions**: Top recommendations
- **Inventory Gaps**: Missing models vs competitors
- **SEO Recommendations**: Content and schema suggestions
- **SEM Recommendations**: PPC campaign ideas
- **Pricing Opportunities**: Competitive pricing analysis

## 🔄 Data Flow

1. **Scraping** (External): Thunderbit/Browse AI scrapes DealerInspire sites
2. **Normalization**: `normalizer.py` parses inconsistent JSON formats
3. **Ingestion**: `ingest.py` loads data into SQLite with deduplication
4. **API**: Flask serves data to frontend
5. **Dashboard**: React displays real-time inventory and insights
6. **Analysis**: AI engine generates competitive intelligence

## 🧪 Testing

### Test Data Ingestion
```bash
cd backend
python3 normalizer.py  # Test normalizer
python3 ingest.py      # Test full pipeline
```

### Test API
```bash
# Start API
python3 api.py

# In another terminal
curl http://localhost:5000/api/health
curl http://localhost:5000/api/clients
curl "http://localhost:5000/api/vehicles?client_id=1"
```

### Test Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

## 📈 Sample Data

The system includes sample data from:
- **Cherry Hill Volkswagen**: 2025-2026 Jetta, Taos models
- **Midstate Chevrolet**: 2026 Trax models

## 🚧 Future Enhancements

### Phase 2 (Not Implemented - Prototype Only)
- [ ] Mapbox integration for geographic heat maps
- [ ] Real-time scraping automation (Zapier/Make)
- [ ] Email/Slack notifications
- [ ] OpenAI API integration for advanced insights
- [ ] User authentication (JWT tokens)
- [ ] Multi-user roles and permissions
- [ ] Export reports (PDF/Excel)
- [ ] Historical trend analysis
- [ ] Automated pricing recommendations

### Production Considerations
- Replace SQLite with PostgreSQL for scale
- Add Redis for caching
- Implement proper authentication (OAuth2)
- Add rate limiting and API keys
- Deploy backend to AWS/GCP
- Deploy frontend to Vercel/Netlify
- Set up CI/CD pipeline
- Add monitoring (Sentry, DataDog)

## 💡 Key Design Decisions

1. **SQLite for Prototype**: Fast setup, zero config, sufficient for demo
2. **Multi-Tenant Schema**: Single database with `client_id` isolation
3. **Normalized Data**: Handles inconsistent scraper outputs
4. **Simplified AI**: Rule-based insights (production would use Claude/GPT API)
5. **Tailwind CSS**: Rapid UI development without custom CSS
6. **ApexCharts**: Rich, interactive charts with minimal code

## 🐛 Troubleshooting

### Backend Issues
```bash
# Database locked
rm backend/praetorian.db
python3 backend/database.py

# Module not found
pip3 install -r backend/requirements.txt
```

### Frontend Issues
```bash
# Dependencies missing
cd frontend && npm install

# Port in use
# Change port in vite.config.js
```

## 📝 License

Prototype for demonstration purposes.

## 👥 Credits

Built as a no-code platform prototype demonstrating:
- Multi-agent architecture
- Data normalization
- Competitive intelligence
- Modern web stack (React + Python)

---

**Status**: ✅ Prototype Complete
**Cost**: <$500/mo at scale (Xano + WeWeb + Thunderbit Pro)
**Deployment**: Ready for production enhancement
