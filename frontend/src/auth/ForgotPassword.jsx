import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import tiendaImg from "../assets/image.png"; // Asegúrate de tener una imagen en esta ruta
import logoImg from "../assets/logo.png"; // Asegúrate de tener un logo en esta ruta

// Se crea un componente de carga simple para reemplazar el archivo externo
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-lg font-semibold">Cargando...</p>
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulamos una llamada a la API (2s)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true); // Mostramos el mensaje de confirmación
    }, 2000);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Fondo vidrioso (igual que en Login) */}
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
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold drop-shadow-md">
                Revisa tu correo
              </h1>
              <p className="mt-4 text-white/90 drop-shadow-sm">
                Si la dirección <span className="font-semibold">{email}</span>{" "}
                está registrada, recibirás un enlace para restablecer tu
                contraseña en breve.
              </p>

              {/* Botón para volver al inicio */}
              <Link
                to="/"
                className="mt-8 inline-block w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200"
              >
                Volver al inicio
              </Link>

              {/* Botón para ir a RecoverPassword */}
              <Link
                to="/recover-password"
                className="mt-4 inline-block w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition duration-200"
              >
                Ir a recuperar contraseña
              </Link>
            </div>
          ) : (
            <>
              {/* Logo */}
              <Link to="/login">
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
                  className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200"
                >
                  Enviar enlace
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
