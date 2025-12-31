#!/bin/bash

echo "🚀 PRAETORIAN - Starting Services"
echo "=================================="
echo ""

# Check if already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend already running on port 5000"
else
    echo "🔧 Starting Backend API..."
    cd backend && python3 api.py > /tmp/praetorian-api.log 2>&1 &
    sleep 2
    echo "✅ Backend started on http://localhost:5000"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Frontend already running on port 3000"
else
    echo "🔧 Starting Frontend Dashboard..."
    cd frontend && npm run dev > /tmp/praetorian-frontend.log 2>&1 &
    sleep 3
    echo "✅ Frontend started on http://localhost:3000"
fi

echo ""
echo "=================================="
echo "🎯 PRAETORIAN IS READY!"
echo "=================================="
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API:       http://localhost:5000"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/praetorian-api.log"
echo "   Frontend: tail -f /tmp/praetorian-frontend.log"
echo ""
echo "🛑 To stop:"
echo "   pkill -f 'python3 api.py'"
echo "   pkill -f 'npm run dev'"
echo ""
