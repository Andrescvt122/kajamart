import Paginator from "../../../../../shared/components/paginator";
import { useState } from "react";
import {
  X,
  Package,
  Calendar,
  User,
  FileText,
  Hash,
  CheckCircle,
  XCircle,
  DollarSign,
  Truck,
} from "lucide-react";

const DetailsReturnProduct = ({ isOpen, onClose, returnData }) => {
  const [page, setPage] = useState(1);
  const perPage = 5;
  const products = returnData?.products || [];
  const totalPages = Math.ceil(products.length / perPage);
  const pageProducts = products.slice((page - 1) * perPage, page * perPage);

  if (!isOpen || !returnData) return null;

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
              Detalles de Devolución de Productos
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
                  <Hash className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    ID de Devolución
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  #{returnData.idReturn}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 ">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Fecha
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {returnData.dateReturn}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 ">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Responsable
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {returnData.responsable}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 lg:col-span-full">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Total de Productos
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {products.length} productos devueltos
                </p>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos Devueltos
                </h3>
              </div>

              <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">ID</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">Nombre</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">Cantidad</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">Precio</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">Descuento</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">Razón</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">Proveedor</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-200">
                    {pageProducts.map((product) => (
                      <tr
                        key={product.idProduct}
                        className="hover:bg-green-100 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.idProduct}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            ${product.price}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {product.discount ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-red-500" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {product.reason}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {product.supplier}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <Paginator
                currentPage={page}
                perPage={perPage}
                totalPages={totalPages}
                filteredLength={products.length}
                goToPage={setPage}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsReturnProduct;
