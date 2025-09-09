import React, { useState, useMemo } from "react";
import { Search, Receipt, X, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CompleteReturn from "./completeReturn";

const ReturnSalesComponent = ({ isModalOpen, setIsModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnProducts, setReturnProducts] = useState([]);
  const [isCompleteReturnOpen, setIsCompleteReturnOpen] = useState(false);

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
        { id: 1, name: "Producto Premium A", quantity: 2, salePrice: 35500 },
        { id: 2, name: "Producto Básico B", quantity: 3, salePrice: 22999 },
      ],
    },
    {
      id: "V002",
      fecha: "2023-12-10",
      cliente: "María García",
      total: 220000,
      medioPago: "Tarjeta",
      estado: "Completada",
      codigoBarras: "123456789012",
      products: [
        { id: 3, name: "Producto Económico D", quantity: 4, salePrice: 15000 },
        { id: 4, name: "Producto Premium E", quantity: 2, salePrice: 80000 },
      ],
    },
  ];

  const filteredSales = useMemo(() => {
    if (!searchTerm) return [];
    return sales.filter(
      (sale) =>
        sale.estado.toLowerCase() === "completada" &&
        (sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.codigoBarras.includes(searchTerm))
    );
  }, [searchTerm]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  const handleSelectSale = (sale) => {
    setSelectedSale(sale);
    setReturnProducts(
      sale.products.map((product) => ({
        ...product,
        returnQuantity: 0,
        selected: false,
      }))
    );
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleProductSelection = (id, selected) => {
    setReturnProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, selected, returnQuantity: selected ? 1 : 0 } : p
      )
    );
  };

  const handleQuantityChange = (id, change) => {
    setReturnProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, Math.min(p.quantity, p.returnQuantity + change));
          return { ...p, returnQuantity: newQty, selected: newQty > 0 };
        }
        return p;
      })
    );
  };

  const calculateReturnTotal = () =>
    returnProducts
      .filter((p) => p.selected)
      .reduce((total, p) => total + p.salePrice * p.returnQuantity, 0);

  return (
    <>
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
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[88vh] p-6 relative overflow-visible"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={22} />
                </button>

                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                  Devolución de Venta
                </h1>

                {/* Buscador */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por ID de venta o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  />
                  {showDropdown && searchTerm && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto overscroll-contain">
                      {filteredSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-3 hover:bg-emerald-50 cursor-pointer"
                          onClick={() => handleSelectSale(sale)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {sale.cliente}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {sale.id} • {sale.fecha}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">
                            {formatPrice(sale.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Productos */}
                {selectedSale && (
                  <div className="space-y-4 mt-6">
                    <h2 className="text-base font-bold text-gray-800">
                      Productos de la venta {selectedSale.id}
                    </h2>
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                      {returnProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-center gap-3 flex-grow">
                            <input
                              type="checkbox"
                              checked={p.selected}
                              onChange={(e) => handleProductSelection(p.id, e.target.checked)}
                              className="h-5 w-5 text-emerald-600 rounded-md border-gray-300"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Originalmente comprado: {p.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(p.id, -1)}
                              disabled={p.returnQuantity === 0}
                              className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 disabled:text-gray-400"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-semibold text-gray-800 w-6 text-center">
                              {p.returnQuantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(p.id, 1)}
                              disabled={p.returnQuantity >= p.quantity}
                              className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 disabled:text-gray-400"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right font-bold text-lg text-gray-800 mt-4 pt-3 border-t border-gray-200">
                      Saldo de la devolución: {formatPrice(calculateReturnTotal())}
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="flex-1 px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setIsCompleteReturnOpen(true)}
                    className="flex-1 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700"
                  >
                    Completar devolución
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CompleteReturn
        isOpen={isCompleteReturnOpen}
        setIsOpen={setIsCompleteReturnOpen}
        selectedSale={selectedSale}
        productsToReturn={returnProducts.filter((p) => p.returnQuantity > 0)}
        returnTotal={calculateReturnTotal()}
      />
    </>
  );
};

export default ReturnSalesComponent;
