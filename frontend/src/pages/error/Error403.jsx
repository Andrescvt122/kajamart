import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Error403() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-400 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-green-400 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-[92%] max-w-xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-8 md:p-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-300/20 flex items-center justify-center">
            <span className="text-3xl font-black text-emerald-200">403</span>
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">
            No autorizado
          </h1>
          <p className="mt-3 text-emerald-100/90 leading-relaxed">
            No tienes permisos para acceder a esta sección.
            <br />
            Si crees que es un error, contacta al administrador o vuelve a una ruta permitida.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-500 transition-colors"
          >
            Volver atrás
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/15 transition-colors"
          >
            Ir al inicio
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
