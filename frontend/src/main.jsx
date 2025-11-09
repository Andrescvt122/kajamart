import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import './index.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 🟢 Instancia global de React Query
const queryClient = new QueryClient();

// 🟢 Montar la aplicación una sola vez
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </PrimeReactProvider>
    </BrowserRouter>
  </React.StrictMode>
);
