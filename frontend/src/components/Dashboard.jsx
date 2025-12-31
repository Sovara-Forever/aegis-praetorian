import React, { useState, useEffect } from 'react'
import axios from 'axios'
import InventoryStats from './InventoryStats'
import ModelDistribution from './ModelDistribution'
import VehicleTable from './VehicleTable'
import CompetitiveInsights from './CompetitiveInsights'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function Dashboard({ client, onLogout }) {
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState(null)
  const [distribution, setDistribution] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [client])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load vehicles
      const vehiclesRes = await axios.get(`${API_BASE}/api/vehicles?client_id=${client.id}`)
      if (vehiclesRes.data.success) {
        setVehicles(vehiclesRes.data.vehicles)
      }

      // Load stats
      const statsRes = await axios.get(`${API_BASE}/api/inventory/stats?client_id=${client.id}`)
      if (statsRes.data.success) {
        setStats(statsRes.data.stats)
      }

      // Load distribution
      const distRes = await axios.get(`${API_BASE}/api/inventory/distribution?client_id=${client.id}`)
      if (distRes.data.success) {
        setDistribution(distRes.data.distribution)
      }

      // Load latest insights
      try {
        const insightsRes = await axios.get(`${API_BASE}/api/analysis/latest?client_id=${client.id}`)
        if (insightsRes.data.success) {
          setInsights(insightsRes.data.analysis)
        }
      } catch (err) {
        // No insights yet
        console.log('No insights available yet')
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAnalysis = async () => {
    try {
      // Get all clients except current one
      const clientsRes = await axios.get(`${API_BASE}/api/clients`)
      const allClients = clientsRes.data.clients
      const competitorIds = allClients
        .filter(c => c.id !== client.id)
        .map(c => c.id)

      const response = await axios.post(`${API_BASE}/api/analysis/generate`, {
        client_id: client.id,
        competitor_ids: competitorIds
      })

      if (response.data.success) {
        setInsights({
          insights_json: response.data.insights,
          recommendations_json: response.data.insights.recommendations
        })
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-praetorian-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PRAETORIAN</h1>
                <p className="text-sm text-gray-600">{client.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'inventory', 'insights'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-praetorian-600 text-praetorian-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <InventoryStats stats={stats} />
            <ModelDistribution distribution={distribution} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h2>
              <div className="text-sm text-gray-600">
                {vehicles.length} vehicles in stock
              </div>
            </div>
            <VehicleTable vehicles={vehicles} />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Competitive Intelligence</h2>
              <button
                onClick={generateAnalysis}
                className="btn-primary"
              >
                Generate New Analysis
              </button>
            </div>
            <CompetitiveInsights insights={insights} />
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
