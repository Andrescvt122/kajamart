import React from "react";
import abarrotes from "../assets/8111255286-95833d8f35-o-1024x576-c.jpg";
import licores from "../assets/tienda-1.jpg";
import dulceria from "../assets/5a1099d2a5e3d.jpeg";
import canastaFamiliar from "../assets/NOTA-1-FOTO-1-TIENDA-DE-BARRIO-scaled.webp";

const About = () => {
  return (
    <section id="about" className="py-16">
      <h4 className="text-black text-center font-bold uppercase">
        Quiénes somos
      </h4>
      <p className="text-center max-w-4xl mx-auto mt-4 text-lg text-black">
        Somos un negocio minorista comprometido con ofrecer abarrotes, licores y
        productos esenciales para la familia. Queremos estar más cerca de ti,
        brindando calidad y atención accesible a toda la comunidad.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-6xl mx-auto">
        {/* Abarrotes */}
        <div className="text-center">
          <h3 className="font-bold mt-4 text-black">Abarrotes</h3>
          <p className="text-black">
            Encuentra lo que necesitas para tu hogar con precios accesibles.
          </p>
          <img
            src={abarrotes}
            alt="Abarrotes"
            className="mt-4 mx-auto rounded-lg shadow-md max-h-60 object-cover"
          />
        </div>

        {/* Licores */}
        <div className="text-center">
          <h3 className="font-bold mt-4 text-black">Licores</h3>
          <p className="text-black">
            Desde cervezas hasta vinos, contamos con las mejores marcas.
          </p>
          <img
            src={licores}
            alt="Licores"
            className="mt-4 mx-auto rounded-lg shadow-md max-h-60 object-cover"
          />
        </div>

        {/* Dulcería y Snacks */}
        <div className="text-center">
          <h3 className="font-bold mt-4 text-black">Dulcería y Snacks</h3>
          <p className="text-black">
            Dulces y bebidas para niños y adultos en cualquier ocasión.
          </p>
          <img
            src={dulceria}
            alt="Dulcería y Snacks"
            className="mt-4 mx-auto rounded-lg shadow-md max-h-60 object-cover"
          />
        </div>

        {/* Canasta Familiar */}
        <div className="text-center">
          <h3 className="font-bold mt-4 text-black">
            Productos de la Canasta Familiar
          </h3>
          <p className="text-black">
            Todo en un solo lugar: productos frescos, de calidad y con atención
            cercana.
          </p>
          <img
            src={canastaFamiliar}
            alt="Canasta Familiar"
            className="mt-4 mx-auto rounded-lg shadow-md max-h-60 object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
