import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Trash2, X, Package } from "lucide-react";
import ProductSearch from "../../../shared/components/productSearch";

const FormRegisterClientReturn = ({isModalOpen, setIsModalOpen}) => {
  // Estado para la lista de productos a devolver
  const [productsToReturn, setProductsToReturn] = useState([]);
  
  // Estado para el término de búsqueda en la barra de búsqueda
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  // Datos de productos de ejemplo. En una aplicación real, esto vendría de una API o base de datos.
  const allProducts = [
    {
      id: 1,
      name: "Producto Premium A",
      barcode: "7501234567890",
      salePrice: 35500,
    },
    {
      id: 2,
      name: "Producto Básico B",
      barcode: "7501234567891",
      salePrice: 22999,
    },
    {
      id: 3,
      name: "Producto Especial C",
      barcode: "7501234567892",
      salePrice: 65000,
    },
    // más productos...
  ];

  // ============================
  // BLOQUEO DE SCROLL
  // ============================
  
  // BLOQUEAR SCROLL EN <body> CUANDO EL MODAL ESTÁ ABIERTO
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isModalOpen]);

  // ============================
  // FUNCIONES AUXILIARES
  // ============================

  // Filtra los productos basados en el término de búsqueda
  const filteredProducts = allProducts.filter(
    (p) =>
      p.barcode.includes(productSearchTerm) ||
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );
  
  // Función para manejar la selección de un producto del dropdown
  const handleSelectProduct = (product) => {
    const existingProduct = productsToReturn.find(p => p.id === product.id);
    if (existingProduct) {
      // Si el producto ya está en la lista, incrementa la cantidad
      setProductsToReturn(
        productsToReturn.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + productQuantity, total: (p.quantity + productQuantity) * p.salePrice }
            : p
        )
      );
    } else {
      // Si es un nuevo producto, añádelo a la lista
      const newProduct = {
        ...product,
        quantity: productQuantity,
        total: product.salePrice * productQuantity,
      };
      setProductsToReturn([...productsToReturn, newProduct]);
    }
    // Limpia el término de búsqueda y cierra el dropdown
    setProductSearchTerm("");
    setProductQuantity(1);
    setShowDropdown(false);
  };

  const handleRemoveProduct = (id) => {
    setProductsToReturn(productsToReturn.filter(p => p.id !== id));
  };

  const handleClear = () => {
    setProductsToReturn([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productsToReturn.length === 0) {
      console.error("Debes agregar al menos un producto para la devolución.");
      return;
    }
    
    console.log("Devolución registrada:", productsToReturn);
    
    // reset
    setProductsToReturn([]);
    setIsModalOpen(false);
    console.log("Devolución registrada exitosamente");
  };

  // ============================
  // CÁLCULOS
  // ============================

  const subtotal = productsToReturn.reduce((sum, p) => sum + p.total, 0);
  const discount = 0;
  const total = subtotal - discount;

  // Formatear precios a moneda local
  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  // ============================
  // JSX DEL MODAL Y FORMULARIO
  // ============================

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* overlay fijo que cubre todo el viewport */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          />

          {/* modal box centrado */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl relative pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Seleccionar Productos a Devolver
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sección de búsqueda de productos */}
                <div className="relative">
                  <label htmlFor="product-search" className="block text-sm text-gray-700 font-medium mb-1">
                    Buscar Productos
                  </label>
                  <div className="relative">
                    <input
                      id="product-search"
                      type="text"
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Ingresar nombre del producto"
                      className="w-full px-4 py-3 pl-10 border rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>

                  {/* Resultados de búsqueda */}
                  {showDropdown && productSearchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-0"
                            onClick={() => handleSelectProduct(product)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.barcode} • {formatPrice(product.salePrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No se encontraron productos
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sección de productos a devolver */}
                <div>
                  <h3 className="text-lg font-semibold my-4 text-gray-800">
                    Productos a Devolver
                  </h3>
                  {productsToReturn.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Producto
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Precio
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {productsToReturn.map(product => (
                            <tr key={product.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatPrice(product.salePrice)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatPrice(product.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(product.id)}
                                  className="text-red-500 hover:text-red-700 transition"
                                  aria-label="Eliminar producto"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 mt-4">
                      No hay productos agregados.
                    </p>
                  )}
                </div>

                {/* Sección de totales */}
                <div className="flex flex-col items-end space-y-2 text-right text-gray-700 font-medium pt-4">
                  <div className="flex justify-between w-full max-w-xs">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs">
                    <span>Descuento</span>
                    <span>{formatPrice(discount)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 shadow-md transition"
                  >
                    Completar Devolución
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FormRegisterClientReturn;
