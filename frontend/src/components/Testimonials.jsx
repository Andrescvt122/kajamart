import React from "react";

const Testimonials = () => {
  const testimonios = [
    {
      nombre: "María López",
      texto:
        "Siempre encuentro lo que necesito y a muy buen precio. La atención es excelente y rápida.",
    },
    {
      nombre: "Carlos Ramírez",
      texto:
        "Me gusta mucho la variedad de productos, especialmente en la sección de licores. ¡Muy recomendados!",
    },
    {
      nombre: "Ana Torres",
      texto:
        "La tienda es muy confiable, siempre entregan productos frescos y de calidad.",
    },
    {
      nombre: "José Martínez",
      texto:
        "Es mi lugar de confianza para hacer las compras de la semana. Muy buen servicio.",
    },
  ];

  return (
    <section id="testimonios" className="py-20 text-center bg-white">
      <h4 className="text-green-600 font-bold uppercase">
        Testimonios - Qué nuestros clientes dicen
      </h4>
      <p className="max-w-4xl mx-auto mt-6 text-lg text-gray-700">
        Nos enorgullece brindar un servicio cercano, rápido y confiable.  
        Estas son algunas opiniones de quienes nos eligen día a día para hacer sus compras esenciales.  
        Su confianza es nuestro mayor respaldo.
      </p>

      {/* Listado de testimonios */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
        {testimonios.map((testimonio, index) => (
          <div
            key={index}
            className="bg-gray-50 shadow-md rounded-xl p-6 text-left"
          >
            <p className="text-gray-700 italic">“{testimonio.texto}”</p>
            <h5 className="mt-4 font-bold text-green-600">
              - {testimonio.nombre}
            </h5>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
