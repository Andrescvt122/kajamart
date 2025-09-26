import React from "react";
import papelHigienico from "../assets/Papel-Expert-FAMILIA-234-mts-3383519_a.webp";
import detergente from "../assets/135860_1_262.webp"
import cafe from "../assets/D_NQ_NP_709823-MLU74087044383_012024-O.webp"
import lecheCondensada from "../assets/Leche-Condensada-La-Lechera-Con-Calcio-X-395g-13940_b.webp"
import ricostilla from "../assets/caldo-costilla-maggi-especias-desmenuzado-caja-x-12-und.jpg"
import piazza from "../assets/Bandeja-Barquillos-De-Chocolate-X-44-gr-13515_a.webp"

const products = [
  { name: "Papel Higiénico", price: "10.000$", img: papelHigienico },
  { name: "Detergente Biodegradable", price: "20.000$", img: detergente },
  { name: "Cafe Mate Nestle", price: "9.000$", img: cafe },
  { name: "Leche Condensada", price: "12.000$", img: lecheCondensada },
  { name: "Ricostilla Maggi", price: "13.500$", img: ricostilla },
  { name: "Piazza Barquillos", price: "8.000$", img: piazza },
];

const Products = () => {
  return (
    <section id="catalogo" className="py-16 bg-gray-50">
      <h4 className="text-black text-center font-bold uppercase">
        Nuestros productos
      </h4>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
        {products.map((p, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-6 bg-white shadow-md rounded-lg"
          >
            <div>
              <h3 className="font-bold text-lg text-black">{p.name}</h3>
              <p className="text-black">{p.price}</p>
            </div>
            <img
              src={p.img}
              alt={p.name}
              className="w-20 h-20 object-contain"
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
      </div>
    </section>
  );
};

export default Products;
