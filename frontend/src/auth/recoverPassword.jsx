// src/auth/RecoverPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import tiendaImg from "../assets/image.png"; // Usa la misma imagen que ForgotPassword
import logoImg from "../assets/logo.png";   // Usa el mismo logo

// Componente de carga
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-lg font-semibold">Actualizando...</p>
      </div>
    </div>
  );
};

export default function RecoverPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // ✅ Si pasa las validaciones nativas, seguimos
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Fondo borroso */}
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

      {/* Contenedor principal */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl">
          {submitted ? (
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold drop-shadow-md">
                ¡Contraseña actualizada!
              </h1>
              <p className="mt-4 text-white/90 drop-shadow-sm">
                Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar
                sesión con tus nuevas credenciales.
              </p>
              <Link
                to="/auth"
                className="mt-8 inline-block w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <>
              {/* Logo */}
              <Link to="/auth">
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
                  Restablecer Contraseña
                </h1>
                <p className="mt-2 text-sm text-white/90 drop-shadow-sm">
                  Crea tu nueva contraseña.
                </p>
              </div>

              {/* Formulario */}
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Nueva contraseña */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white drop-shadow">
                    Nueva contraseña
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}"
                    title="Debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y un símbolo."
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

                {/* Confirmar contraseña */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white drop-shadow">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}"
                    title="Debe coincidir con la contraseña y tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y un símbolo."
                    className="w-full pl-3 pr-10 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[34px] text-gray-500 hover:text-emerald-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-300 bg-red-900/50 px-3 py-2 rounded-lg text-center drop-shadow-md">
                    {error}
                  </p>
                )}

                {/* Botón enviar */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-200"
                >
                  Actualizar Contraseña
                </motion.button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
