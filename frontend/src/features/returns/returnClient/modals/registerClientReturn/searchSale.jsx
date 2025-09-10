import React, { useState, useMemo } from "react";
import { Search, Receipt } from "lucide-react";

const SalesSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const sales = [
    {
      id: "V001",
      fecha: "2023-12-05",
      cliente: "Carlos López",
      total: 150000,
      medioPago: "Efectivo",
      estado: "Anulada",
      codigoBarras: "987654321098",
      products: [
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
      ],
    },
    {
      id: "V002",
      fecha: "2023-12-05",
      cliente: "María García",
      total: 89500,
      medioPago: "Tarjeta",
      estado: "Completada",
      codigoBarras: "123456789012",
      products: [
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
      ],
    },
    {
      id: "V003",
      fecha: "2023-12-06",
      cliente: "Juan Martínez",
      total: 245000,
      medioPago: "Efectivo",
      estado: "Completada",
      codigoBarras: "456789012345",
      products: [
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
      ],
    },
    {
      id: "V004",
      fecha: "2023-12-06",
      cliente: "Ana Rodríguez",
      total: 67800,
      medioPago: "Transferencia",
      estado: "Pendiente",
      codigoBarras: "789012345678",
      products: [
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
      ],
    },
    {
      id: "V005",
      fecha: "2023-12-07",
      cliente: "Pedro Sánchez",
      total: 125000,
      medioPago: "Efectivo",
      estado: "Completada",
      codigoBarras: "321098765432",
      products: [
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
      ],
    },
  ];

  const filteredSales = useMemo(() => {
    if (!searchTerm) return [];
    return sales.filter(
      (sale) =>
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.codigoBarras.includes(searchTerm) ||
        sale.medioPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.estado.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (date) => new Date(date).toLocaleDateString("es-ES");

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "completada":
        return "text-green-600";
      case "anulada":
        return "text-red-600";
      case "pendiente":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
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
          {filteredSales.length > 0 ? (
            <div className="p-2">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-lg mb-1 border border-gray-100"
                  onClick={() => {
                    // Aquí puedes agregar la lógica para seleccionar la venta
                    console.log("Venta seleccionada:", sale);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sale.cliente}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {sale.id} • {formatDate(sale.fecha)} •{" "}
                            {formatPrice(sale.total)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-medium ${getEstadoColor(
                              sale.estado
                            )}`}
                          >
                            {sale.estado}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {sale.medioPago}
                          </p>
                        </div>
                      </div>
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
