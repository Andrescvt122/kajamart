import React from 'react'
import { createRoot } from 'react-dom/client'
import Footer from './components/footerComponent'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Footer />
  </React.StrictMode>
)
