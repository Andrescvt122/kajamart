import React from 'react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api';
import './index.css'
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import FooterComponent from './components/Footer';

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
  <PrimeReactProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    </PrimeReactProvider>
  </BrowserRouter>
)
