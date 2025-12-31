#!/bin/bash

echo "🚀 PRAETORIAN SETUP SCRIPT"
echo "================================"

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Install Python dependencies
echo "Installing Python packages..."
pip3 install -r requirements.txt

# Initialize database
echo "Initializing database..."
python3 database.py

# Ingest sample data
echo "Ingesting sample data..."
python3 ingest.py

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install Node dependencies
echo "Installing Node packages..."
npm install

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && python3 api.py"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
