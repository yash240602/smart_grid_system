import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Determine the base URL based on the environment
// In GitHub Pages deployment, use '/smart_grid_system/'
// In Vercel or other deployments, use '/'
const isGitHubPages = 
  import.meta.env.MODE === 'production' && 
  location.hostname.includes('github.io');

const basename = isGitHubPages ? '/smart_grid_system/' : '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 