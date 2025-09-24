import React from 'react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import Footer from './components/footerComponent'
import { PrimeReactProvider } from 'primereact/api';
import './index.css'
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
  <PrimeReactProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    </PrimeReactProvider>
  </BrowserRouter>
)
