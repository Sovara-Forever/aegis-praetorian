import React, { useState } from 'react'

function Login({ clients, onLogin }) {
  const [selectedClient, setSelectedClient] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const client = clients.find(c => c.id === parseInt(selectedClient))
    if (client) {
      onLogin(client)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-praetorian-900 via-praetorian-800 to-praetorian-700">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-praetorian-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PRAETORIAN</h1>
            <p className="text-gray-600">Automotive Intelligence Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Select Dealership
              </label>
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-praetorian-500 focus:border-transparent"
                required
              >
                <option value="">Choose your dealership...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-praetorian-600 hover:bg-praetorian-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Access Dashboard
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Multi-tenant competitive intelligence system</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-white text-center">
          <div>
            <div className="text-2xl font-bold">Real-Time</div>
            <div className="text-sm opacity-80">Inventory Sync</div>
          </div>
          <div>
            <div className="text-2xl font-bold">AI-Powered</div>
            <div className="text-sm opacity-80">Insights</div>
          </div>
          <div>
            <div className="text-2xl font-bold">Competitive</div>
            <div className="text-sm opacity-80">Analysis</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
