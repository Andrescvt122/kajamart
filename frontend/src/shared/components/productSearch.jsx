import React, { useState, useMemo } from "react";
import { Search, Package } from "lucide-react";

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const products = [
    {
      id: 1,
      barcode: "7501234567890",
      name: "Producto Premium A",
      expiryDate: "2025-12-15",
      quantity: 50,
      salePrice: 35500,
      category: "Alimentación",
    },
    {
      id: 2,
      barcode: "7501234567891",
      name: "Producto Básico B",
      expiryDate: "2025-06-20",
      quantity: 120,
      salePrice: 22999,
      category: "Bebidas",
    },
    {
      id: 3,
      barcode: "7501234567892",
      name: "Producto Especial C",
      expiryDate: "2025-09-10",
      quantity: 75,
      salePrice: 65000,
      category: "Cuidado Personal",
    },
    // más productos...
  ];

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(
      (p) =>
        p.barcode.includes(searchTerm) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (date) => new Date(date).toLocaleDateString("es-ES");

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Resultados */}
      {showDropdown && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-md z-50 max-h-80 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.barcode} • {formatDate(product.expiryDate)} •{" "}
                      {formatPrice(product.salePrice)}
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
  );
};

export default ProductSearch;
