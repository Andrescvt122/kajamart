import React from "react";
import logo from "../../../assets/logo.png";

export default function Navbar() {
  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Sobre nosotros", href: "#about" },
    { name: "Catálogo", href: "#productos" },
    { name: "Testimonios", href: "#testimonios" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 px-8 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-md">
      
      {/* Logo + Nombre */}
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="h-12" />
        <span className="text-2xl font-bold text-green-900 tracking-wider">
          KAJAMART
        </span>
      </div>

      {/* Links */}
      <ul className="hidden md:flex space-x-10 font-medium text-gray-800">
        {navLinks.map((link, i) => (
          <li key={i} className="relative group">
            <a
              href={link.href}
              className="transition-colors duration-300 hover:text-green-600"
            >
              {link.name}
            </a>
            {/* Subrayado animado */}
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-600 transition-all group-hover:w-full"></span>
          </li>
        ))}
      </ul>

      {/* Botón login */}
      <div className="hidden md:block">
        <a
          href="/auth"
          className="px-6 py-2 rounded-full bg-green-900 text-white font-semibold shadow-md hover:bg-green-700 transition-colors"
        >
          Ingresar
        </a>
      </div>
    </nav>
  );
}
