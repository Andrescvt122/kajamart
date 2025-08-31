import React from 'react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import Footer from './components/footerComponent'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
)
