import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const options = [
  {
    title: "Cerca de ti",
    description:
      "Somos tu tienda de barrio: compras rápidas, sin vueltas y a la mano.",
    img: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Precios justos",
    description:
      "Ofrecemos precios accesibles y productos para el día a día.",
    img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Variedad para tu hogar",
    description:
      "Abarrotes, snacks, bebidas y lo esencial para tu casa en un solo lugar.",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Atención cercana",
    description:
      "Te atendemos con amabilidad y confianza, como debe ser en el barrio.",
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
  },
];

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const rotateCounterClockwise = () => {
    setCurrentIndex((prev) => (prev - 1 + options.length) % options.length);
  };

  const getPositionStyle = (index) => {
    const positions = [
      { x: 0, y: -180, scale: 0.6, zIndex: 2, opacity: 0.6 },
      { x: 220, y: 0, scale: 1.4, zIndex: 5, opacity: 1 },
      { x: 0, y: 180, scale: 0.6, zIndex: 2, opacity: 0.6 },
      { x: -3000, y: 0, scale: 0, zIndex: 0, opacity: 0 },
    ];
    return positions[index];
  };

  const bigOptionIndex = (currentIndex + 1) % options.length;
  const bigOption = options[bigOptionIndex];

  return (
    <section id="about" className="py-20 relative">
      {/* Título */}
      <div className="text-center relative z-30">
        <h4 className="text-white font-bold uppercase text-3xl">
          ¿Por qué elegirnos?
        </h4>
        <p className="text-white/80 mt-3 max-w-2xl mx-auto px-6">
          Somos una tienda de barrio pensada para tu día a día: cercana, confiable
          y con lo esencial siempre disponible.
        </p>
      </div>

      {/* Fondo dinámico */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={bigOptionIndex}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              backgroundImage: `url(${bigOption.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
      </div>

      {/* Botón girar minimalista */}
      <motion.button
        onClick={rotateCounterClockwise}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 
        flex items-center justify-center rounded-full border border-white/40 
        text-white text-3xl backdrop-blur-md bg-white/10 shadow-lg z-30"
        whileHover={{ scale: 1.15, rotate: -12 }}
        whileTap={{ scale: 0.9, rotate: 5 }}
        aria-label="Rotar opciones"
      >
        ⟳
      </motion.button>

      <div className="relative w-full h-[460px] mt-92 flex items-center z-20 px-6">
        {/* Carrusel más a la izquierda */}
        <div className="relative w-[55%] h-full flex justify-start items-center ml-4">
          {options.map((option, i) => {
            const posIndex =
              (i - currentIndex + options.length) % options.length;
            const { x, y, scale, zIndex, opacity } = getPositionStyle(posIndex);

            return (
              <motion.div
                key={i}
                animate={{ x, y, scale, opacity }}
                transition={{ type: "spring", stiffness: 60, damping: 25 }}
                style={{ position: "absolute", zIndex }}
                className="bg-white/15 backdrop-blur-md border border-white/20 
                p-4 rounded-xl shadow-md w-64 text-center text-white"
              >
                <img
                  src={option.img}
                  alt={option.title}
                  className="w-16 h-16 object-cover rounded-full mx-auto mb-3 border border-white/40"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <h3 className="font-bold text-lg">{option.title}</h3>
              </motion.div>
            );
          })}
        </div>

        {/* Card de descripción más a la derecha */}
        <motion.div
          className="bg-white/15 backdrop-blur-lg border border-white/20 
          p-8 rounded-xl shadow-lg w-[450px] text-left text-white ml-24"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={bigOption.img}
            alt={bigOption.title}
            className="w-full h-40 object-cover rounded-lg mb-4"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <h3 className="font-bold text-2xl mb-4 text-green-300">
            {bigOption.title}
          </h3>
          <p className="text-white/90">{bigOption.description}</p>

          {/* Extra: mini lista de “por qué elegirnos” */}
          <ul className="mt-5 space-y-2 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <span className="text-green-300">✔</span> Atención cercana y confiable
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✔</span> Precios justos para el día a día
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✔</span> Variedad y productos esenciales
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✔</span> Compra rápida, sin complicaciones
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
