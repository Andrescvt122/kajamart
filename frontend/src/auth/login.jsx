// src/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Assets
import tiendaImg from "../assets/tienda.png";
import logo from "../assets/logo.png";

// Componentes
import Loading from "../features/onboarding/loading";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true); // activamos el loading
    // Simulamos la carga de datos (2s por ejemplo)
    setTimeout(() => {
      setLoading(false);
      navigate("/app"); // navegamos después del loading
    }, 2000);
  };

  if (loading) {
    return <Loading />; // mostramos el loading mientras
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Fondo vidrioso */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${tiendaImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px) brightness(0.7)",
          zIndex: 0,
        }}
      ></div>

      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Contenedor login */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl">
          {/* Logo */}
          <motion.img
            src={logo} // tu PNG con transparencia
            alt="Logo"
            className="w-40 mt-6 mb-8 mx-auto block relative z-50 cursor-pointer"
            style={{
              // contorno nítido que sigue la silueta + sombra limpia abajo (sin crear recuadro)
              filter: `
      drop-shadow(1px 1px 0 rgba(255,255,255,0.98))
      drop-shadow(-1px -1px 0 rgba(255,255,255,0.98))
      drop-shadow(0 12px 18px rgba(2,6,23,0.14))
    `,
              willChange: "transform, filter",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              // ligera flotación/respiración para dar vida sin pasarse
              y: [0, -10, 0],
              rotate: [-1, 2, -1],
              opacity: 1,
              scale: 1,
            }}
            transition={{
              // animación idle: solo transform/rotate (GPU-friendly)
              y: {
                duration: 4.4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              },
              rotate: {
                duration: 9.4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              },
            }}
            whileHover={{
              // Hover más notorio: escala, elevación, micro-tilt + filtro puntual (solo on-demand)
              scale: 1.18,
              y: -12,
              rotate: -3,
              filter: `
      drop-shadow(2px 2px 0 rgba(255,255,255,1))
      drop-shadow(-2px -2px 0 rgba(255,255,255,1))
      drop-shadow(0 28px 44px rgba(2,6,23,0.28))
      /* acento de luz colorida pero controlada (no mancha) */
      drop-shadow(0 0 18px rgba(255, 255, 255, 0.28))
      brightness(1.12) saturate(1.15)
    `,
            }}
          />

          {/* Encabezado */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Bienvenido
            </h1>
            <p className="mt-2 text-sm text-white/90 drop-shadow-sm">
              Inicia sesión para continuar
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-white drop-shadow">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white drop-shadow">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="********"
                className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                className="text-sm font-medium text-white/90 hover:text-white drop-shadow"
                to="/forgot-password"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
