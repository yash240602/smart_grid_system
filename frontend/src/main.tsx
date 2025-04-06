import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Determine the base URL based on the environment
// In production with GitHub Pages, use '/smart_grid_system/'
// In development, use '/'
const basename = import.meta.env.MODE === 'production' ? '/smart_grid_system/' : '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 