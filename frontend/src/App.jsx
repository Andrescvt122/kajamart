// src/App.jsx

import React from 'react';
import Footer from './components/footerComponent'; // Importamos el componente Footer
import './App.css'; // Si tienes estilos personalizados de la app

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8" aria-hidden="true">
        <h1>footer</h1>
      </main>
      <Footer />
    </div>
  );
}

export default App;