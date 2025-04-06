import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingIndicator from './components/LoadingIndicator'
import './App.css'

// Lazy loading components for better performance
const Dashboard = lazy(() => import('./views/Dashboard'))
const Login = lazy(() => import('./views/Login'))
const MLInsights = lazy(() => import('./views/MLInsights'))

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // Check if user is authenticated (has a valid token)
    const token = localStorage.getItem('token')
    if (token) {
      // In a real app, you would validate the token here
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="container">
          <Suspense fallback={<LoadingIndicator message="Loading page..." />}>
            <Routes>
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              {/* ML Insights page is publicly accessible for recruiters */}
              <Route path="/ml-insights" element={<MLInsights />} />
              {/* Support additional recruiter-related paths */}
              <Route path="/recruiter" element={<Navigate to="/ml-insights" />} />
              <Route path="/recruiter-login" element={<Navigate to="/ml-insights" />} />
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              } />
              {/* Catch all unknown routes */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App 