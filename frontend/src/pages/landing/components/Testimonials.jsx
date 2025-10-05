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
  
    // Aquí empiezan los nuevos
    { nombre: "Lucía Ortega", texto: "Los precios son muy competitivos, ahorro bastante.", img: "https://randomuser.me/api/portraits/women/61.jpg" },
    { nombre: "Hernán López", texto: "Nunca he tenido problemas con mis pedidos.", img: "https://randomuser.me/api/portraits/men/60.jpg" },
    { nombre: "Sofía Morales", texto: "Excelente calidad, lo recomiendo a todos.", img: "https://randomuser.me/api/portraits/women/62.jpg" },
    { nombre: "Ricardo Pardo", texto: "El servicio al cliente me resolvió todo en minutos.", img: "https://randomuser.me/api/portraits/men/63.jpg" },
    { nombre: "Juliana Restrepo", texto: "Siempre cumplen con los tiempos de entrega.", img: "https://randomuser.me/api/portraits/women/64.jpg" },
    { nombre: "Esteban Villa", texto: "Los combos de mercado son muy prácticos.", img: "https://randomuser.me/api/portraits/men/64.jpg" },
    { nombre: "Fernanda Arias", texto: "Me encanta que puedo pagar con diferentes métodos.", img: "https://randomuser.me/api/portraits/women/66.jpg" },
    { nombre: "Santiago Giraldo", texto: "Todo llega tal cual lo pedí, impecable.", img: "https://randomuser.me/api/portraits/men/65.jpg" },
    { nombre: "Catalina Jaramillo", texto: "El sistema de puntos me parece genial.", img: "https://randomuser.me/api/portraits/women/67.jpg" },
    { nombre: "Tomás Quintero", texto: "Siempre atentos a mis dudas, excelente servicio.", img: "https://randomuser.me/api/portraits/men/66.jpg" },
    { nombre: "Mariana Patiño", texto: "La experiencia de compra es muy fluida.", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { nombre: "Gabriel Suárez", texto: "Me gusta que tengan productos locales.", img: "https://randomuser.me/api/portraits/men/67.jpg" },
    { nombre: "Diana Salazar", texto: "Todo se siente muy organizado y fácil.", img: "https://randomuser.me/api/portraits/women/69.jpg" },
    { nombre: "Pablo Castaño", texto: "Nunca falta lo que busco, siempre disponible.", img: "https://randomuser.me/api/portraits/men/68.jpg" },
    { nombre: "Mónica Cárdenas", texto: "Muy buena app, se nota que la actualizan seguido.", img: "https://randomuser.me/api/portraits/women/70.jpg" },
    { nombre: "Andrés Cardona", texto: "Las promociones son muy buenas, aprovecho siempre.", img: "https://randomuser.me/api/portraits/men/69.jpg" },
    { nombre: "Verónica Aguilar", texto: "La navegación en la app es sencilla y rápida.", img: "https://randomuser.me/api/portraits/women/71.jpg" },
    { nombre: "Mauricio Ocampo", texto: "Nunca se me ha dañado un pedido, todo bien.", img: "https://randomuser.me/api/portraits/men/70.jpg" },
    { nombre: "Sara Lozano", texto: "Es mi opción número uno para las compras.", img: "https://randomuser.me/api/portraits/women/72.jpg" },
    { nombre: "Camilo López", texto: "Muy recomendada, nunca falla.", img: "https://randomuser.me/api/portraits/men/71.jpg" },
    { nombre: "Elena Duque", texto: "Ahorro tiempo y dinero, increíble servicio.", img: "https://randomuser.me/api/portraits/women/73.jpg" },
    { nombre: "Martín Restrepo", texto: "Me encanta lo organizado de la plataforma.", img: "https://randomuser.me/api/portraits/men/72.jpg" },
    { nombre: "Alejandra Rueda", texto: "Los productos siempre llegan en perfectas condiciones.", img: "https://randomuser.me/api/portraits/women/74.jpg" },
    { nombre: "Felipe Torres", texto: "Muy buena experiencia de compra.", img: "https://randomuser.me/api/portraits/men/73.jpg" },
    { nombre: "Vanessa Morales", texto: "Todo llega fresco y a buen precio.", img: "https://randomuser.me/api/portraits/women/75.jpg" },
    { nombre: "Julián Zapata", texto: "Puedo confiar en que siempre tendrán stock.", img: "https://randomuser.me/api/portraits/men/74.jpg" },
    { nombre: "Manuela Gil", texto: "Recomiendo esta tienda a todos mis amigos.", img: "https://randomuser.me/api/portraits/women/76.jpg" },
    { nombre: "Diego Mejía", texto: "Excelente servicio, muy puntual.", img: "https://randomuser.me/api/portraits/men/75.jpg" },
    { nombre: "Carolina Osorio", texto: "La plataforma nunca se cae, confiable.", img: "https://randomuser.me/api/portraits/women/77.jpg" },
    { nombre: "Fernando Vélez", texto: "Buen surtido y calidad en todo.", img: "https://randomuser.me/api/portraits/men/76.jpg" },
    { nombre: "Adriana Montoya", texto: "Todo llega perfecto y a tiempo.", img: "https://randomuser.me/api/portraits/women/78.jpg" },
    { nombre: "Oscar Ramírez", texto: "Muy buen servicio en general.", img: "https://randomuser.me/api/portraits/men/77.jpg" },
    { nombre: "Liliana Cano", texto: "La interfaz es súper fácil de usar.", img: "https://randomuser.me/api/portraits/women/79.jpg" },
    { nombre: "Mauricio Bedoya", texto: "Nunca me ha fallado la app, excelente.", img: "https://randomuser.me/api/portraits/men/78.jpg" },
    { nombre: "Estefanía Peña", texto: "Los productos llegan siempre bien empacados.", img: "https://randomuser.me/api/portraits/women/80.jpg" },
    { nombre: "Andrés Ramírez", texto: "Siempre tienen promociones atractivas.", img: "https://randomuser.me/api/portraits/men/79.jpg" },
    { nombre: "Claudia Ortiz", texto: "Muy buena experiencia cada vez que compro.", img: "https://randomuser.me/api/portraits/women/81.jpg" },
  ];
  

  const [positions, setPositions] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);

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
