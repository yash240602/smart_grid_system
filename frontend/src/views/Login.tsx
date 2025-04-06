import { useState } from 'react'
import { login } from '../services/api'
import AuthForm from '../components/AuthForm'
import './Login.css'

interface LoginProps {
  onLogin: (token: string) => void
}

const Login = ({ onLogin }: LoginProps) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await login(username, password)
      onLogin(response.access_token)
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    handleSubmit('demo_recruiter', 'smart_grid_2024')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-hero">
          <div className="hero-content">
            <h1>Smart Grid ML Platform</h1>
            <p className="hero-subtitle">Advanced Machine Learning for Energy Optimization</p>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🧠</span>
                <p>Neural Networks</p>
              </div>
              <div className="feature">
                <span className="feature-icon">📈</span>
                <p>Predictive Analytics</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🔍</span>
                <p>Anomaly Detection</p>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <p>Energy Optimization</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-card">
          <h2>Welcome Back</h2>
          <AuthForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            buttonText="Login"
          />
          
          <div className="login-divider">
            <span>or</span>
          </div>
          
          <div className="recruiter-access">
            <h3>Recruiter Demo Access</h3>
            <p>Exploring our platform for hiring purposes?</p>
            <button 
              className="btn btn-secondary demo-button" 
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <span className="demo-icon">🔐</span>
              Access with Demo Account
            </button>
            <div className="demo-credentials">
              <p><strong>Username:</strong> demo_recruiter</p>
              <p><strong>Password:</strong> smart_grid_2024</p>
            </div>
          </div>
          
          <div className="login-info">
            <p>This system showcases advanced ML capabilities in energy grid management.</p>
            <p className="tech-stack">Built with: React, TypeScript, Python, TensorFlow, PyTorch</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 