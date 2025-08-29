import React from 'react';
import './footerComponent.css';
import logo from '../assets/Kajamart.jpeg';

export default function FooterComponent() {
  return (
    <footer className="fc w-full">
      <div className="fc-inner">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <img src={logo} alt="Logo de Kajamart" className="fc-logo rounded-full" />
          <div>
            <h2 className="text-lg font-bold">Kajamart</h2>
          </div>
        </div>

        <div className="footer-groups">
          <nav>
            <h3 className="font-semibold">Enlaces</h3>
            <ul>
              <li><a href="#" className="fc-link">Inicio</a></li>
              <li><a href="#" className="fc-link">Servicios</a></li>
              <li><a href="#" className="fc-link">Productos</a></li>
            </ul>
          </nav>

          <address>
            <h3 className="font-semibold">Contacto</h3>
            <ul>
              <li><a href="#" className="fc-link">Contacto</a></li>
              <li><a href="#" className="fc-link">Soporte</a></li>
              <li><a href="#" className="fc-link">Política de privacidad</a></li>
            </ul>
          </address>
        </div>

        <div style={{fontSize: '12px', color: 'rgba(0,0,0,0.6)'}}>&copy; {new Date().getFullYear()} Kajamart. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}
