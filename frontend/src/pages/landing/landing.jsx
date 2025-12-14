import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Products from "./components/Products";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import About from "./components/About";
import Footer from "./components/Footer";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

function FixedOverlay({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647, // MAX
        pointerEvents: "none", // 👈 la capa no bloquea clicks
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export default function LandingPage() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* ✅ UI fija (SIEMPRE visible) */}
      <FixedOverlay>
        {/* Navbar fija */}
        <div style={{ pointerEvents: "auto" }}>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0 }}>
            <Navbar />
          </div>
        </div>

        {/* Botón fijo */}
        <div style={{ pointerEvents: "auto" }}>
          <motion.button
            type="button"
            onClick={scrollToTop}
            style={{
              position: "fixed",
              right: "1.5rem",
              bottom: "1.5rem",
            }}
            className="w-14 h-14 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-500"
            whileHover={{ scale: 1.15, boxShadow: "0 0 20px rgba(0,255,120,0.7)" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Subir"
            title="Subir"
          >
            ↑
          </motion.button>
        </div>
      </FixedOverlay>

      {/* Contenido con padding para no quedar debajo de la navbar */}
      <main className="flex-grow pt-24">
        <Header />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <Products />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <Features />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <Testimonials />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <About />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
