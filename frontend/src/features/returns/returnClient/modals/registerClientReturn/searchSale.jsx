import React, { useState } from "react";
import { Search, Receipt } from "lucide-react";
import { useFetchSales } from "../../../../../shared/components/hooks/search/useFetchSales";

const SalesSearch = ({ onSelectSale }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: sales, loading, error } = useFetchSales(searchTerm);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-CO");
  };

  const getProductLabel = (sale) => {
    const firstProduct =
      sale?.detalle_venta?.[0]?.detalle_productos?.productos?.nombre?.trim() ||
      "";
    if (!firstProduct) return "Producto no disponible";
    const hasMoreProducts = (sale?.detalle_venta?.length || 0) > 1;
    return `${firstProduct}${hasMoreProducts ? "..." : ""}`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Título */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Buscar Ventas</h2>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por ID, cliente, código de barras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Resultados */}
      {showDropdown && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Buscando ventas...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : sales.length > 0 ? (
            <div className="p-2">
              {sales.map((sale) => (
                <div
                  key={sale.id_venta}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-lg mb-1 border border-gray-100"
                  onClick={() => {
                    onSelectSale?.(sale);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {sale?.clientes?.nombre_cliente?.trim() ||
                          "Cliente sin nombre"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(sale?.fecha_venta)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getProductLabel(sale)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron ventas
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesSearch;
