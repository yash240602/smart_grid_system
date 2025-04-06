import { useState } from 'react'
import './AuthForm.css'

interface AuthFormProps {
  onSubmit: (username: string, password: string) => Promise<void>
  buttonText?: string
  isLoading?: boolean
  error?: string | null
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  buttonText = 'Login',
  isLoading = false,
  error = null,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Trim inputs to handle whitespace
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    // Simple validation
    if (!trimmedUsername) {
      setValidationError('Username is required')
      return
    }
    
    if (!trimmedPassword) {
      setValidationError('Password is required')
      return
    }
    
    setValidationError(null)
    
    try {
      await onSubmit(trimmedUsername, trimmedPassword)
    } catch (err) {
      // Error handling is done in the parent component
    }
  }

  // Helper to display user-friendly credential info for recruiter demo
  const showCredentialHint = () => {
    if (error && error.includes('Invalid')) {
      return (
        <div className="credential-hint">
          <p>For recruiter demo use:</p>
          <p><strong>Username:</strong> demo_recruiter</p>
          <p><strong>Password:</strong> smart_grid_2024</p>
        </div>
      );
    }
    return null;
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {(error || validationError) && (
        <div className="error-message">
          {error || validationError}
          {showCredentialHint()}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          placeholder="Enter your username"
          autoComplete="username"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>
      
      <button 
        type="submit" 
        className={`btn btn-primary auth-form-button ${isLoading ? 'loading' : ''}`} 
        disabled={isLoading}
      >
        {isLoading ? 'Please wait...' : buttonText}
      </button>
    </form>
  )
}

export default AuthForm 