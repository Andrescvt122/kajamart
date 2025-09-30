import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ondas from "../../../assets/ondasHorizontal.png";

export default function Header() {
  const [particles, setParticles] = useState(
    Array.from({ length: 10 }, () => ({
      size: Math.random() * 6 + 4,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: Math.random() * 0.2 - 0.1,
      dy: Math.random() * 0.2 - 0.1,
      color: Math.random() > 0.5 ? "rgba(0, 92, 14, 0.4)" : "rgba(0, 84, 21, 0.4)",
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.dx;
          let newY = p.y + p.dy;
          if (newX > 100 || newX < 0) p.dx = -p.dx;
          if (newY > 100 || newY < 0) p.dy = -p.dy;
          return { ...p, x: newX, y: newY };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const scrollToProducts = () => {
    const section = document.getElementById("productos");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      className="relative flex flex-col justify-center items-center px-12 py-16 h-[500px] md:h-[600px] overflow-hidden"
      style={{
        backgroundImage: `url(${ondas}), linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.05))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: `${p.y}%`,
            left: `${p.x}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            zIndex: 0,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 max-w-xl p-10 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-xl flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-black drop-shadow-md tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Productos que hacen tu día más fácil
        </motion.h1>
        <motion.p
          className="mt-4 text-base md:text-lg text-black/80 leading-relaxed"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          Encuentra todo lo que tu familia necesita en un solo lugar: comida, bebida y hogar.
        </motion.p>
        <motion.button
          onClick={scrollToProducts}
          className="mt-8 px-10 py-4 bg-black text-white font-medium rounded-full shadow-md cursor-pointer"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{
            scale: 1.05,
            backgroundColor: "#111",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          Explorar productos
        </motion.button>
      </motion.div>
    </section>
  );
}
