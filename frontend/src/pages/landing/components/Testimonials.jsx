// MemoriesBouncing.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MemoriesBouncing = () => {
  const testimonios = [
    { nombre: "María López", texto: "Siempre encuentro lo que necesito y a muy buen precio.", img: "https://randomuser.me/api/portraits/women/65.jpg" },
    { nombre: "Carlos Ramírez", texto: "Me gusta mucho la variedad de productos.", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { nombre: "Ana Torres", texto: "La tienda es muy confiable.", img: "https://randomuser.me/api/portraits/women/12.jpg" },
    { nombre: "José Martínez", texto: "Es mi lugar de confianza.", img: "https://randomuser.me/api/portraits/men/44.jpg" },
    { nombre: "Laura Sánchez", texto: "La app es muy intuitiva.", img: "https://randomuser.me/api/portraits/women/23.jpg" },
    { nombre: "David Herrera", texto: "Me sorprendió la rapidez de la entrega.", img: "https://randomuser.me/api/portraits/men/18.jpg" },
    { nombre: "Camila Ríos", texto: "Los productos de aseo siempre vienen bien empacados.", img: "https://randomuser.me/api/portraits/women/47.jpg" },
    { nombre: "Andrés Gómez", texto: "La atención al cliente es impecable.", img: "https://randomuser.me/api/portraits/men/9.jpg" },
    { nombre: "Paola Méndez", texto: "Me encanta la frescura de las frutas y verduras.", img: "https://randomuser.me/api/portraits/women/33.jpg" },
    { nombre: "Felipe Castro", texto: "Hacer mercado se volvió más fácil y rápido.", img: "https://randomuser.me/api/portraits/men/56.jpg" },
    { nombre: "Valentina Ruiz", texto: "Siempre encuentro productos frescos y de calidad.", img: "https://randomuser.me/api/portraits/women/50.jpg" },
  { nombre: "Sebastián Molina", texto: "El servicio es rápido y confiable.", img: "https://randomuser.me/api/portraits/men/51.jpg" },
  { nombre: "Camila Fernández", texto: "Me encanta la variedad que tienen todos los días.", img: "https://randomuser.me/api/portraits/women/52.jpg" },
  { nombre: "Juan Pérez", texto: "Muy buena atención al cliente y excelente calidad.", img: "https://randomuser.me/api/portraits/men/53.jpg" },
  { nombre: "Natalia Gómez", texto: "Puedo hacer mis compras en minutos, ¡me encanta!", img: "https://randomuser.me/api/portraits/women/54.jpg" },
  { nombre: "Mateo Rodríguez", texto: "Entrega rápida y productos bien empacados.", img: "https://randomuser.me/api/portraits/men/55.jpg" },
  { nombre: "Isabella Torres", texto: "La app es fácil de usar y confiable.", img: "https://randomuser.me/api/portraits/women/56.jpg" },
  { nombre: "Andrés Vargas", texto: "Siempre encuentro lo que busco, muy recomendado.", img: "https://randomuser.me/api/portraits/men/57.jpg" },
  { nombre: "Daniela Castro", texto: "La frescura de las frutas y verduras es increíble.", img: "https://randomuser.me/api/portraits/women/58.jpg" },
  { nombre: "Miguel Ramírez", texto: "Comprar aquí hace que mi semana sea mucho más fácil.", img: "https://randomuser.me/api/portraits/men/59.jpg" },

  ];

  const [positions, setPositions] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);

  // Inicializar posiciones y velocidades
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const init = testimonios.map(() => ({
      x: Math.random() * (w - 200) + 100,
      y: Math.random() * (h - 200) + 100,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
    }));

    setPositions(init);

    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % testimonios.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Movimiento de recuerdos
  useEffect(() => {
    const move = () => {
      setPositions((prev) =>
        prev.map((p) => {
          let x = p.x + p.vx;
          let y = p.y + p.vy;
          let vx = p.vx;
          let vy = p.vy;

          if (x < 100 || x > window.innerWidth - 100) vx *= -1;
          if (y < 100 || y > window.innerHeight - 100) vy *= -1;

          return { x, y, vx, vy };
        })
      );
    };

    const id = setInterval(move, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="testimonios"
      className="relative py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden h-[100vh]"
    >
      <div className="text-center mb-10 relative z-20">
        <h4 className="text-green-600 font-bold uppercase tracking-wide">
          Testimonios
        </h4>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mt-2">
          Recuerdos de nuestros clientes
        </h2>
      </div>

      <div className="absolute inset-0">
        <AnimatePresence>
          {testimonios.map((t, i) => {
            const pos = positions[i] || { x: 200, y: 200 };
            const isCenter = i === centerIndex;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  top: isCenter ? "50%" : pos.y,
                  left: isCenter ? "50%" : pos.x,
                  x: "-50%",
                  y: "-50%",
                  scale: isCenter ? 1.3 : 0.7,
                  opacity: isCenter ? 1 : 0.5,
                  zIndex: isCenter ? 50 : 1,
                  filter: isCenter ? "blur(0px)" : "blur(6px)",
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-[260px] text-center ${
                  isCenter ? "ring-4 ring-green-400" : ""
                }`}
              >
                <img
                  src={t.img}
                  alt={t.nombre}
                  className="w-14 h-14 rounded-full object-cover border-4 border-green-400 mx-auto mb-4 shadow-md"
                />
                <p className="text-gray-700 italic text-sm leading-relaxed mb-4">
                  “{t.texto}”
                </p>
                <h5 className="font-bold text-green-600">— {t.nombre}</h5>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MemoriesBouncing;
