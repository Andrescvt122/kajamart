import React from "react";

const Header = () => {
  return (
    <section id="inicio" className="bg-green-100 flex flex-col md:flex-row justify-between items-center px-12 py-16">
      <div>
        <h1 className="text-5xl font-bold text-black">La mejor tienda cerca de ti</h1>
        <p className="mt-4 text-lg text-gray-700">
          Te ayudamos con tus productos para la familia, comida y bebida!
        </p>
      </div>
    </section>
  );
};

export default Header;
