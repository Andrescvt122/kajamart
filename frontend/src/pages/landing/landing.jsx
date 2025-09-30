import React from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Features from "./components/Features";
import About from "./components/About";
import Products from "./components/Products";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function LandingPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Navbar — siempre visible y fija arriba */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Contenido con padding para no quedar debajo de la navbar */}
      <main className="flex-grow pt-24">
        <Header />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <Features />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <About />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <Products />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <Testimonials />
        </motion.div>
      </main>

      <Footer />

      {/* Botón de subir — siempre visible */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-500 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.15, boxShadow: "0 0 20px rgba(0,255,120,0.7)" }}
        whileTap={{ scale: 0.95 }}
      >
        ↑
      </motion.button>
    </div>
  );
}
