import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentClient, setCurrentClient] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients`)
      if (response.data.success) {
        setClients(response.data.clients)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (client) => {
    setCurrentClient(client)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setCurrentClient(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-praetorian-900 to-praetorian-700">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <Login clients={clients} onLogin={handleLogin} />
      ) : (
        <Dashboard client={currentClient} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
