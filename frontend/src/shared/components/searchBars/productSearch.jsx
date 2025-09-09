import React, { useState, useMemo } from "react";
import { Search, Package } from "lucide-react";

/**
 * ProductSearch Optimizado
 * - La barra de búsqueda es siempre editable y accesible
 * - Incluye campo numérico para cantidad
 * - Botón "Añadir Producto" con validaciones
 * - Alertas claras para errores de validación
 */
const ProductSearch = ({ onSelectProduct, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
    {
      id: 4,
      barcode: "7501234567893",
      name: "Producto Económico D",
      expiryDate: "2025-12-15",
      quantity: 200,
      salePrice: 15000,
      category: "Alimentación",
    },
    {
      id: 5,
      barcode: "7501234567894",
      name: "Producto Premium E",
      expiryDate: "2025-12-15",
      quantity: 30,
      salePrice: 80000,
      category: "Tecnología",
    },
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

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowDropdown(false);
    // También notificar al componente padre si es necesario
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleAddProduct = () => {
    // Validaciones
    if (!selectedProduct) {
      showAlertMessage("Debes seleccionar un producto primero");
      return;
    }

    if (!quantity || quantity <= 0) {
      showAlertMessage("Debes especificar una cantidad válida");
      return;
    }

    if (quantity > selectedProduct.quantity) {
      showAlertMessage(`Solo hay ${selectedProduct.quantity} unidades disponibles`);
      return;
    }

    // Si todo está correcto, añadir el producto
    if (onAddProduct) {
      onAddProduct({ ...selectedProduct, requestedQuantity: quantity });
    }

    // Limpiar el formulario después de añadir
    handleClearSearch();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedProduct(null);
    setQuantity(1);
    setShowDropdown(false);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Si el usuario empieza a escribir algo diferente, limpiar la selección
    if (selectedProduct && value !== selectedProduct.name) {
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta de validación */}
      {showAlert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
          <strong className="font-bold">Error: </strong>
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Dropdown de resultados */}
        {showDropdown && searchTerm && !selectedProduct && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-md z-50 max-h-80 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleProductSelect(product);
                  }}
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
                        {product.barcode} • {formatDate(product.expiryDate)} • {formatPrice(product.salePrice)}
                      </p>
                      <p className="text-xs text-emerald-600">
                        Stock: {product.quantity} unidades
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

      {/* Información del producto seleccionado */}
      {selectedProduct && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">
                {formatPrice(selectedProduct.salePrice)} • Stock: {selectedProduct.quantity}
              </p>
            </div>
          </div>

          {/* Controles de cantidad y botón añadir */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Cantidad:
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduct.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <button
              onClick={handleAddProduct}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors font-medium"
            >
              Añadir Producto
            </button>
            
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;