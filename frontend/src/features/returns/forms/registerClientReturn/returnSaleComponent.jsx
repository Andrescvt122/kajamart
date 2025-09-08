import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Receipt, X, Package, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReturnSalesComponent = ({ isModalOpen, setIsModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnProducts, setReturnProducts] = useState([]);
  const searchRef = useRef(null);

  const sales = [
    {
      id: "V001",
      fecha: "2023-12-05",
      cliente: "Carlos López",
      total: 150000,
      medioPago: "Efectivo",
      estado: "Completada",
      codigoBarras: "987654321098",
      products: [
        {
          id: 1,
          barcode: "7501234567890",
          name: "Producto Premium A",
          expiryDate: "2025-12-15",
          quantity: 2,
          salePrice: 35500,
          category: "Alimentación",
        },
        {
          id: 2,
          barcode: "7501234567891",
          name: "Producto Básico B",
          expiryDate: "2025-06-20",
          quantity: 1,
          salePrice: 22999,
          category: "Bebidas",
        },
        {
          id: 3,
          barcode: "7501234567892",
          name: "Producto Especial C",
          expiryDate: "2025-09-10",
          quantity: 3,
          salePrice: 65000,
          category: "Cuidado Personal",
        },
      ],
    },
    {
      id: "V002",
      fecha: "2023-12-06",
      cliente: "Ana García",
      total: 220000,
      medioPago: "Tarjeta",
      estado: "Completada",
      codigoBarras: "123456789012",
      products: [
        {
          id: 4,
          barcode: "7501234567893",
          name: "Producto D",
          expiryDate: "2024-11-20",
          quantity: 1,
          salePrice: 150000,
          category: "Tecnología",
        },
        {
          id: 5,
          barcode: "7501234567894",
          name: "Producto E",
          expiryDate: "2025-03-01",
          quantity: 2,
          salePrice: 35000,
          category: "Alimentación",
        },
      ],
    },
  ];

  const filteredSales = useMemo(() => {
    if (!searchTerm) return [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        sale.cliente.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, sales]);

  useEffect(() => {
    // Cerrar el dropdown al hacer clic fuera
    function handleOutsideClick(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

  const handleSelectSale = (sale) => {
    setSelectedSale(sale);
    setSearchTerm("");
    setShowDropdown(false);
    // Inicializar los productos a devolver con cantidad 0
    setReturnProducts(
      sale.products.map((p) => ({ ...p, returnQuantity: 0 }))
    );
  };

  const handleReturnQuantityChange = (productId, amount) => {
    setReturnProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId
          ? {
              ...p,
              returnQuantity: Math.min(
                Math.max(0, p.returnQuantity + amount),
                p.quantity
              ),
            }
          : p
      )
    );
  };

  const calculateReturnTotal = () => {
    return returnProducts.reduce(
      (total, product) => total + product.returnQuantity * product.salePrice,
      0
    );
  };

  const handleClearForm = () => {
    setSelectedSale(null);
    setReturnProducts([]);
    setSearchTerm("");
  };

  const handleStartReturn = () => {
    if (!selectedSale) {
      console.log("Por favor, selecciona una venta para la devolución.");
      return;
    }
    const productsToReturn = returnProducts.filter(
      (p) => p.returnQuantity > 0
    );
    if (productsToReturn.length === 0) {
      console.log("Por favor, selecciona al menos un producto para devolver.");
      return;
    }

    console.log("Devolución iniciada para la venta:", selectedSale.id);
    console.log("Productos a devolver:", productsToReturn);

    // Lógica para procesar la devolución (por ejemplo, enviar a una API)
    // En este ejemplo, solo cerramos el modal y reseteamos el estado.
    setIsModalOpen(false);
    handleClearForm();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl relative pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Devolución de Venta
              </h2>
              {/* Barra de búsqueda de ventas */}
              <div className="relative w-96 mx-auto mb-6" ref={searchRef}>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="sales-search"
                    className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-400 sm:text-sm sm:leading-6 transition-all bg-white"
                    placeholder="Buscar por ID de venta o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                  />
                </div>

                {/* Dropdown de resultados sin límite de altura */}
                {showDropdown && searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0"
                          onClick={() => handleSelectSale(sale)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{sale.cliente}</p>
                              <p className="text-xs text-gray-500">
                                ID: {sale.id} • {sale.fecha}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-800">{formatPrice(sale.total)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No se encontraron coincidencias.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Formulario de devolución */}
              {selectedSale && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Productos de la venta {selectedSale.id}
                  </h3>
                  {returnProducts.length > 0 && (
                    <div className="space-y-4">
                      {returnProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm"
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              Originalmente comprado: {product.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReturnQuantityChange(product.id, -1)}
                              disabled={product.returnQuantity === 0}
                              className="w-8 h-8 rounded-full border border-green-500 bg-green-100 text-green-700 flex items-center justify-center disabled:opacity-50 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg text-gray-800 min-w-[32px] text-center">
                              {product.returnQuantity}
                            </span>
                            <button
                              onClick={() => handleReturnQuantityChange(product.id, 1)}
                              disabled={product.returnQuantity >= product.quantity}
                              className="w-8 h-8 rounded-full border border-green-500 bg-green-100 text-green-700 flex items-center justify-center disabled:opacity-50 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Totales */}
                  <div className="pt-4 border-t">
                    <p className="text-lg font-semibold text-right">
                      Total a devolver: {formatPrice(calculateReturnTotal())}
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleClearForm}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800 font-medium transition-all"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={handleStartReturn}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                    >
                      Completar devolución
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReturnSalesComponent;
