// src/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react"; // Agregué AlertCircle para el mensaje de error

// Assets
import tiendaImg from "../assets/image.png";
import logo from "../assets/logo.png";

// Componentes
import Loading from "../features/onboarding/loading";

// API (IMPORTANTE: Ajusta la ruta si tu archivo axiosConfig está en otro lado)
import api from "../api/axiosConfig"; 

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Estado para guardar mensajes de error del backend

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valida con las reglas HTML (required, pattern, etc.)
    if (e.target.checkValidity()) {
      setLoading(true);
      setError(""); // Limpiamos errores previos

      // 1. Extraer datos directamente de los inputs del formulario
      const email = e.target.email.value;
      const password = e.target.password.value;

      try {
        // 2. Petición al Backend
        const response = await api.post('/auth/login', { email, password });
        
        // 3. Si es exitoso:
        const { token, user } = response.data;
        
        // Guardar en LocalStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirigir
        navigate("/app");

      } catch (err) {
        console.error(err);
        // 4. Si falla: Mostrar mensaje del servidor (ej: "Credenciales inválidas")
        setError(err.response?.data?.error || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }

    } else {
      e.target.reportValidity(); // fuerza mostrar el tooltip del navegador
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${tiendaImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px) brightness(1.1)",
          zIndex: 0,
        }}
      ></div>

      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Contenedor login */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl">
          {/* Logo */}
          <motion.img
            src={logo}
            alt="Logo"
            className="w-40 mt-6 mb-8 mx-auto block cursor-pointer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              y: [0, -10, 0],
              rotate: [-1, 2, -1],
              opacity: 1,
              scale: 1,
            }}
            transition={{
              y: { duration: 4.4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
              rotate: { duration: 9.4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.1, rotate: -3 }}
          />

          {/* Encabezado */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">Bienvenido</h1>
            <p className="mt-2 text-sm text-white/90 drop-shadow-sm">
              Inicia sesión para continuar
            </p>
          </div>

          {/* 🔴 ALERTA DE ERROR (Solo se muestra si hay error) */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/80 backdrop-blur-sm border border-red-400 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-lg"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white drop-shadow">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                required
                title="Por favor ingresa un correo válido."
                className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-white drop-shadow">
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                // Nota: He comentado el pattern temporalmente. 
                // Si tus usuarios de prueba tienen claves sencillas (ej: "123456"),
                // el pattern no te dejará enviar el formulario.
                // Descoméntalo cuando vayas a producción.
                /* pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}" */
                minLength={6} 
                className="w-full pl-3 pr-10 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-emerald-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Link olvidar contraseña */}
            <div className="flex items-center justify-between">
              <Link
                className="text-sm font-medium text-white/90 hover:text-white drop-shadow"
                to="/forgot-password"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón ingresar */}
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200"
            >
              Ingresar
            </button>

            {/* Botón volver */}
            <Link
              to="/"
              className="block w-full text-center px-4 py-2 text-sm font-semibold text-emerald-600 bg-white rounded-xl shadow-lg hover:bg-gray-100 transition duration-200"
            >
              Volver
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}