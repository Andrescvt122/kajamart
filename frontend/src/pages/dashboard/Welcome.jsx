import React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, MessageSquareHeart, Sparkles } from "lucide-react";
import welcomeIllustration from "../../assets/cafe-removebg-preview.png";
import { useAuth } from "../../context/useAtuh.jsx";
const accentGradient = "bg-gradient-to-br from-emerald-200 via-emerald-100 to-emerald-50";

export default function Welcome() {
  const {payload} = useAuth();
  // TODO: reemplazar "user" con el nombre del usuario autenticado cuando el acceso esté implementado.
  console.log("payload welcome", payload);
  const username = payload?.nombre || "";;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full">
      <div
        className={`${accentGradient} relative overflow-hidden rounded-3xl border border-emerald-900/10 p-10 shadow-[0_35px_120px_-40px_rgba(16,185,129,0.6)]`}
      >
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-4 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative flex flex-col-reverse gap-12 lg:flex-row lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 space-y-6 text-emerald-900"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] text-emerald-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Bienvenido
            </div>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              ¡Hola, <span className="text-emerald-700">{username}</span>!
            </h1>
            <p className="max-w-xl text-lg text-emerald-900/80">
              Nos alegra tenerte de vuelta. Aquí podrás monitorear tus ventas, organizar tu inventario
              y mantener el control de tus devoluciones con la mejor experiencia para tu tienda.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:max-w-lg">
              <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center gap-3 text-emerald-700">
                  <CalendarCheck className="h-5 w-5" />
                  <span className="font-semibold">Planifica tu día</span>
                </div>
                <p className="text-sm text-emerald-900/70">
                  a las ventas recientes y organiza los pendientes de tu equipo.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center gap-3 text-emerald-700">
                  <MessageSquareHeart className="h-5 w-5" />
                  <span className="font-semibold">Atiende a tus clientes</span>
                </div>
                <p className="text-sm text-emerald-900/70">
                  Mantén al día las devoluciones y cuida cada detalle de su experiencia.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex flex-1 items-center justify-center"
          >
            <div className="relative flex w-full max-w-md items-center justify-center">
              <div className="absolute inset-0 -translate-y-6 scale-[1.05] rounded-[40px] bg-emerald-500/25 blur-2xl" />
              <img
                src={welcomeIllustration}
                alt="Ilustración de bienvenida"
                className="relative w-full max-w-sm drop-shadow-[0_35px_45px_rgba(16,185,129,0.35)]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
