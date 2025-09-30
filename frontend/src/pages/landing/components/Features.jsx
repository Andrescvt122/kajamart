import React from "react";
import { motion } from "framer-motion";
import { LineChart, Heart, Handshake } from "lucide-react";

const features = [
  {
    title: "Calidad",
    desc: "Tenemos productos de alta calidad de los mejores proveedores.",
    icon: LineChart,
  },
  {
    title: "Frescura",
    desc: "Nuestros productos son cuidados con los estándares necesarios para ser lo más frescos posibles.",
    icon: Heart,
  },
  {
    title: "Compromiso",
    desc: "Comprometidos a dar el mejor servicio más amigable y justo para nuestros clientes.",
    icon: Handshake,
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="py-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg,rgba(224, 247, 224, 0.74) 0%,rgb(255, 255, 255) 100%)", // fondo minimalista
      }}
    >
      <h4 className="text-green-700 font-bold uppercase text-center drop-shadow-md">
        ¿Qué hacemos nosotros?
      </h4>
      <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-center text-black/90 drop-shadow-sm">
        Poner tus productos desde la canasta familiar hasta tus fiestas en tu barrio.
      </h2>

      <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mt-12">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={idx}
              className="p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex flex-col items-center text-center shadow-lg"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              <div className="w-20 h-20 flex items-center justify-center bg-green-100/40 rounded-xl mb-5 shadow-inner">
                <Icon className="w-10 h-10 text-green-700" />
              </div>
              <h3 className="text-2xl font-bold text-black drop-shadow-sm">{f.title}</h3>
              <p className="mt-3 text-gray-800 leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
