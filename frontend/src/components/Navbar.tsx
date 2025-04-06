import { Link } from 'react-router-dom'
import './Navbar.css'

interface NavbarProps {
  isAuthenticated: boolean
  onLogout: () => void
}

const Navbar = ({ isAuthenticated, onLogout }: NavbarProps) => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">GridGenius</span>
        </Link>
        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">🏡</span>
                Control Center
              </Link>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">📈</span>
                Stats
              </Link>
              <Link to="/ml-insights" className="nav-link">
                <span className="nav-icon">🤖</span>
                ML Magic
              </Link>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">🛟</span>
                SOS
              </Link>
              <Link to="/ml-insights" className="nav-link recruiter-link">
                <span className="nav-icon">👥</span>
                For Recruiters
              </Link>
              <button className="btn btn-outline" onClick={onLogout}>
                <span className="nav-icon">🚪</span>
                Bail Out
              </button>
            </>
          ) : (
            <>
              <Link to="/ml-insights" className="nav-link">
                <span className="nav-icon">🤖</span>
                ML Magic
              </Link>
              <Link to="/login" className="nav-link highlight-link">
                <span className="nav-icon">🔐</span>
                Jump In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 