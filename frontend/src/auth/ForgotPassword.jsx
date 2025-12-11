import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react"; // Importamos icono de alerta (si no tienes lucide-react, quita esta línea e icono)

// Assets
import tiendaImg from "../assets/image.png"; 
import logoImg from "../assets/logo.png"; 

// API (Importante: Conexión con el Backend)
import api from "../api/axiosConfig"; 

// Componente de carga
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black/50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-lg font-semibold">Enviando solicitud...</p>
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(""); // Estado para errores
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Limpiar errores previos

    try {
      // ✅ PETICIÓN REAL AL BACKEND
      // Esto envía el email al puerto 3000 -> authController -> Nodemailer
      await api.post("/auth/forgot-password", { email });
      
      setSubmitted(true); // Mostrar pantalla de éxito

    } catch (err) {
      console.error("Error enviando correo:", err);
      // Mostrar mensaje de error del servidor o uno genérico
      setError(err.response?.data?.error || "Hubo un error al intentar enviar el correo. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
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
          filter: "blur(10px) brightness(1.1)",
          zIndex: 0,
        }}
      ></div>

      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Contenedor */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl">
          
          {submitted ? (
            // VISTA DE ÉXITO (Correo enviado)
            <div className="text-center text-white">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-400"
              >
                <span className="text-3xl">✉️</span>
              </motion.div>

              <h1 className="text-2xl font-bold drop-shadow-md">
                Revisa tu correo
              </h1>
              <p className="mt-4 text-white/90 drop-shadow-sm">
                Si la dirección <span className="font-semibold text-emerald-300">{email}</span>{" "}
                está registrada, hemos enviado las instrucciones.
              </p>
              <p className="mt-2 text-sm text-white/70">
                (Revisa también la carpeta de Spam)
              </p>

              {/* Botón Volver */}
              <div className="mt-6">
                <Link
                  to="/" // Volvemos al Login
                  className="block w-full text-center px-4 py-2 text-sm font-semibold text-emerald-600 bg-white rounded-xl shadow-lg hover:bg-gray-100 transition duration-200"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            // VISTA FORMULARIO
            <>
              {/* Logo */}
              <Link to="/">
                <motion.img
                  src={logoImg}
                  alt="Logo"
                  className="w-32 mb-6 mx-auto block cursor-pointer"
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </Link>

              {/* Encabezado */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white drop-shadow-md">
                  Recuperar Contraseña
                </h1>
                <p className="mt-2 text-sm text-white/90 drop-shadow-sm">
                  Ingresa tu correo para recibir un enlace de recuperación.
                </p>
              </div>

              {/* Alerta de Error (Solo si falla) */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/80 backdrop-blur-sm border border-red-400 text-white px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg"
                >
                  {/* Si no tienes el icono AlertCircle, borra la siguiente línea */}
                  <AlertCircle size={20} /> 
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Formulario */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-white drop-shadow">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Enviar enlace
                </button>
              </form>

              <div className="text-center mt-4">
                 <Link to="/" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                    ← Cancelar y volver
                 </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}