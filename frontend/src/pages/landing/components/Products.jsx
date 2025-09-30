import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import papelHigienico from "../../../assets/png-transparent-toilet-paper-scroll-hygiene-toilet-paper-miscellaneous-hygiene-soap-removebg-preview.png";
import detergente from "../../../assets/detergente-removebg-preview.png";
import cafe from "../../../assets/cafe-removebg-preview.png";
import lecheCondensada from "../../../assets/lecherita-removebg-preview.png";
import ricostilla from "../../../assets/caldo-costilla-maggi-especias-desmenuzado-caja-x-12-und.jpg";
import piazza from "../../../assets/piazza-removebg-preview.png";

const products = [
  { id: 1, name: "Piazza Barquillos", price: "8.000$", img: piazza, desc: "Crocantes y con cobertura de chocolate." },
  { id: 2, name: "Detergente Biodegradable", price: "20.000$", img: detergente, desc: "Limpieza potente y ecoamigable." },
  { id: 3, name: "Ricostilla Maggi", price: "13.500$", img: ricostilla, desc: "Caldo concentrado, sabor casero." },
  { id: 4, name: "Café Mate Nestlé", price: "9.000$", img: cafe, desc: "Sabor intenso para tu mañana." },
  { id: 5, name: "Leche Condensada", price: "12.000$", img: lecheCondensada, desc: "Ideal para postres y café." },
  { id: 6, name: "Papel Higiénico", price: "10.000$", img: papelHigienico, desc: "Pack familiar, suave y resistente." },
];

export default function Products() {
  const [centerIndex, setCenterIndex] = useState(0);
  const total = products.length;
  const pauseDuration = 4000;
  const transitionDuration = 1.2;

  useEffect(() => {
    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % total);
    }, pauseDuration + transitionDuration * 1000);
    return () => clearInterval(interval);
  }, [total]);

  const getStyle = (offset) => {
    const spacingX = 370;
    const x = offset * spacingX;
    const scale = Math.max(0.5, 1 - offset * 0.25);
    const blur = offset * 4;
    const zIndex = 20 - offset;
    return { x, scale, blur, zIndex };
  };

  const textVariants = {
    initial: { opacity: 0, y: 30, x: -10 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit: { opacity: 0, y: -10, x: -20 },
  };

  const [particles, setParticles] = useState(
    Array.from({ length: 8 }, () => ({
      size: Math.random() * 6 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: Math.random() > 0.5 ? "rgba(35,255,68,0.6)" : "rgba(21, 115, 0, 0.41)",
      dx: Math.random() * 0.3 - 0.15,
      dy: Math.random() * 0.3 - 0.15,
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

  return (
    <section id="productos" className="relative py-12 bg-gradient-to-br from-green-50 to-gray-100 overflow-hidden">
      <h2 className="text-5xl font-extrabold uppercase px-12 mb-6 text-gray drop-shadow-xl">
        Nuestros productos
      </h2>

      <div className="flex items-center justify-start px-12 gap-8 h-[560px] relative">
        <div className="w-1/3 flex flex-col justify-center pr-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={products[centerIndex].id}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-black-500 mb-2">{products[centerIndex].name}</h2>
              <p className="text-2xl text-green-500 drop-shadow-md mb-4">{products[centerIndex].price}</p>
              <p className="text-lg font-medium text-black-200 leading-relaxed drop-shadow-md">{products[centerIndex].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* PARTICULAS y CARRUSEL */}
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

        <div className="w-2/3 h-full relative flex items-center justify-start overflow-visible" style={{ perspective: 1200 }}>
          <div className="relative w-full h-full flex items-center justify-start" style={{ transformStyle: "preserve-3d" }}>
            <AnimatePresence>
              {[0, 1, 2].map((offset) => {
                const productIndex = (centerIndex + offset) % total;
                const style = getStyle(offset);
                return (
                  <motion.div
                    key={products[productIndex].id}
                    className="absolute flex items-center justify-center"
                    initial={{ scale: 0.6, x: style.x }}
                    animate={{ scale: style.scale, x: style.x }}
                    exit={{ scale: style.scale * 1.2, x: style.x - 350, opacity: 0 }}
                    transition={{ duration: transitionDuration }}
                    style={{ zIndex: style.zIndex, filter: `blur(${style.blur}px)` }}
                  >
                    <img
                      src={products[productIndex].img}
                      alt={products[productIndex].name}
                      className="w-[520px] h-[420px] object-contain drop-shadow-2xl"
                      draggable={false}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
