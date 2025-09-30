import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import abarrotes from "../../../assets/abarrotes.avif";
import licores from "../../../assets/licores.jpg";
import dulceria from "../../../assets/dulces.jpg";
import canastaFamiliar from "../../../assets/canasta.jpg";

const options = [
  {
    title: "Abarrotes",
    description:
      "Encuentra lo que necesitas para tu hogar con precios accesibles.",
    img: abarrotes,
  },
  {
    title: "Licores",
    description: "Desde cervezas hasta vinos, contamos con las mejores marcas.",
    img: licores,
  },
  {
    title: "Dulcería y Snacks",
    description: "Dulces y bebidas para niños y adultos en cualquier ocasión.",
    img: dulceria,
  },
  {
    title: "Productos de la Canasta Familiar",
    description:
      "Todo en un solo lugar: productos frescos, de calidad y con atención cercana.",
    img: canastaFamiliar,
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
          Quiénes somos
        </h4>
        <p className="text-white/80 mt-3 max-w-2xl mx-auto px-6">
          Somos un mercado integral que conecta tradición y calidad en cada
          producto. Nuestro objetivo es brindarte confianza y cercanía,
          ofreciendo una experiencia única de compra.
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
          />
          <h3 className="font-bold text-2xl mb-4 text-green-300">
            {bigOption.title}
          </h3>
          <p className="text-white/90">{bigOption.description}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
