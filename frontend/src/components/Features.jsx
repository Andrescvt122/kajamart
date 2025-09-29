import React from "react";
import { LineChart, Heart, Handshake } from "lucide-react"; // Importamos íconos de lucide-react

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
    <section id="features" className="py-16 text-center">
      <h4 className="text-green-600 font-bold uppercase">¿Qué hacemos nosotros?</h4>
      <h2 className="text-2xl md:text-3xl font-bold mt-2">
        Poner tus productos desde la canasta familiar hasta para tus fiestas en tu mismo barrio.
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="p-6 bg-white rounded-lg flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-xl mb-4">
                <Icon className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-gray-600">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
