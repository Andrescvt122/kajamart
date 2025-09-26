import React from "react";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <img src={logo} alt="Logo" className="h-12" />

      {/* Se cambió `text-black` por `text-gray-900` para un negro más oscuro */}
      <ul className="flex space-x-12 font-medium text-gray-900">
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#about">Sobre nosotros</a></li>
        <li><a href="#catalogo">Catálogo</a></li>
        <li><a href="#testimonios">Testimonios</a></li>
      </ul>

      <div className="space-x-4">
        <a 
          href="/auth" 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Ingresar
        </a>
      </div>
    </nav>
  );
};

export default Navbar;