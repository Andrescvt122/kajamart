import React from "react";
import {
  X,
  Package,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Hash,
  Trash2,
} from "lucide-react";

const DetailsLow = ({ isOpen, onClose, lowData }) => {
  if (!isOpen || !lowData) return null;

  return (
    <>
      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Detalles de Baja de Productos
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 ">
                <div className="flex items-center gap-3 mb-2">
                  <Hash className="text-red-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    ID de Baja
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  #{lowData.idLow}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 ">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-red-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Fecha
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {lowData.dateLow}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 ">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-red-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Tipo
                  </span>
                </div>
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  {lowData.type}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-red-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Responsable
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {lowData.responsible}
                </p>
              </div>
              {/* Razón de la Baja */}
              <div className="bg-red-100 rounded-lg p-4 border border-red-200 lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Motivo de la Baja
                  </h3>
                </div>
                <p className="text-gray-700">{lowData.reason}</p>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                <Package className="text-red-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos
                </h3>
              </div>

              <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Hash size={14} />
                          ID
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Package size={14} />
                          Nombre
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                        Cantidad Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Trash2 size={14} />
                          Cantidad de Baja
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200">
                    {lowData.products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-red-100 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">
                            {product.lowQuantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <X size={18} />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsLow;
