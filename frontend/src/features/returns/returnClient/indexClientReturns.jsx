import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion } from "framer-motion";
import ReturnSalesComponent from "./modals/registerClientReturn/returnSaleComponent";
import DetailsClientReturn from "./modals/detailsClientReturn/detailsClientReturn";
import generateProductReturnsPDF from "./helpers/exportToPdf";
import generateProductReturnsXLS from "../returnProduct/helper/exportToXls";
export default function IndexClientReturns() {
  const baseReturns = [];
  for (let i = 1; i <= 44; i++) {
    // Lista de razones posibles para devolución
    const reasons = [
      "Producto dañado",
      "Producto vencido",
      "Producto incorrecto",
      "Producto no requerido"
    ];
    const reason = reasons[i % reasons.length];

    // Selección ponderada para que 'a proveedor' y 'completado' sean más probables
    const pickStatus = (reason) => {
      // Solo N/A para productos dañados, el resto puede ir a proveedor
      if (reason === "Producto dañado") return "N/A";
      const r = Math.random();
      if (r < 0.45) return "a proveedor"; // 45%
      if (r < 0.8) return "completado"; // 35%
      if (r < 0.95) return "registrado"; // 15%
      return "rechazado"; // 5%
    };

    const statusSuppliers = pickStatus(reason);

    baseReturns.push({
      idReturn: i,
      idSale: 100 + i,
      productsToReturn: [
        { idProduct: 1, name: "Producto A", quantity: 2, price: 100 },
        { idProduct: 2, name: "Producto B", quantity: 1, price: 200 },
        { idProduct: 3, name: "Producto C", quantity: 3, price: 150 },
      ],
      productsClientReturn: [
        { idProduct: 1, name: "Producto A", quantity: 2, price: 100, reason, statusSuppliers },
        { idProduct: 2, name: "Producto B", quantity: 1, price: 200, reason, statusSuppliers },
        { idProduct: 3, name: "Producto C", quantity: 3, price: 150, reason, statusSuppliers },
        { idProduct: 4, name: "Producto D", quantity: 5, price: 50, reason, statusSuppliers },
        { idProduct: 5, name: "Producto E", quantity: 1, price: 300, reason, statusSuppliers },
        { idProduct: 6, name: "Producto F", quantity: 2, price: 250, reason, statusSuppliers },
      ],
      dateReturn: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
      client: `Cliente ${i}`,
      responsable: `Empleado ${i}`,
      typeReturn:
        i % 3 === 0 ? "Reembolso del dinero" : "Cambio por otro producto",
      total: Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000,
    });
  }
  const [returns, setReturns] = useState([...baseReturns]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Estado para el modal de detalles
  const [selectedReturn, setSelectedReturn] = useState(null); // Estado para la devolución seleccionada
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const supplierStatusOptions = [
    "a proveedor",
    "completado",
    "registrado",
    "rechazado",
  ];

  const lockedSupplierStatuses = new Set(["completado", "rechazado", "n/a"]);

  const [activeStatusEditor, setActiveStatusEditor] = useState(null);


  // Función para abrir el modal de detalles
  const handleViewDetails = (rowData) => {
    // rowData contains return-level fields plus `currentProduct`
    setSelectedReturn(rowData);
    setIsDetailsModalOpen(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReturn(null);
  };

  // Normalización de texto
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    const match = (val) => normalizeText(String(val ?? "")).includes(s);

    if (!s) {
      // Expandir cada devolución en múltiples filas, una por producto
      return returns.flatMap((returnItem) =>
        returnItem.productsClientReturn.map((product) => ({
          ...returnItem,
          currentProduct: product,
        }))
      );
    }

    // Filtrar (incluyendo campos de productsClientReturn) y luego expandir los resultados filtrados
    return returns
      .filter((returnItem) => {
        // Buscar en campos simples del return
        const topMatch = Object.entries(returnItem).some(([, v]) => {
          if (Array.isArray(v)) return false;
          return match(v);
        });
        // Buscar dentro de cada productsClientReturn
        const productMatch = returnItem.productsClientReturn.some((prod) =>
          Object.values(prod).some((val) => match(val))
        );
        return topMatch || productMatch;
      })
      .flatMap((returnItem) =>
        returnItem.productsClientReturn.map((product) => ({
          ...returnItem,
          currentProduct: product,
        }))
      );
  }, [returns, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
    setActiveStatusEditor(null);
  };
  const getStatusEditorKey = (returnId, productId) => `${returnId}-${productId}`;

  const handleStatusClick = (returnId, productId, statusLabel = "") => {
    const normalized = (statusLabel || "").toLowerCase();
    if (lockedSupplierStatuses.has(normalized)) return;
    const key = getStatusEditorKey(returnId, productId);
    setActiveStatusEditor((prev) => (prev === key ? null : key));
  };

  const handleStatusChange = (returnId, productId, nextStatus) => {
    setReturns((prev) =>
      prev.map((returnItem) => {
        if (returnItem.idReturn !== returnId) return returnItem;
        return {
          ...returnItem,
          productsClientReturn: returnItem.productsClientReturn.map((prod) =>
            prod.idProduct === productId
              ? { ...prod, statusSuppliers: nextStatus }
              : prod
          ),
        };
      })
    );
    setActiveStatusEditor(null);
  };


  // Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Fondo de ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Devoluciones de clientes</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administrador de tienda
            </p>
          </div>
        </div>

        {/* Barra de búsqueda + botones */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar devoluciones..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setActiveStatusEditor(null);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <ExportExcelButton event={generateProductReturnsXLS}>Excel</ExportExcelButton>
            <ExportPDFButton event={generateProductReturnsPDF}>PDF</ExportPDFButton>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar nueva devolución
            </button>
          </div>
        </div>

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Devolución</th>
                <th className="px-6 py-4">Venta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Razón</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-100"
              variants={tableVariants}
            >
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No se encontraron devoluciones.
                  </td>
                </tr>
              ) : (
                pageItems.map((s, i) => (
                  <motion.tr
                    key={s.idReturn + "-" + i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.idReturn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.idSale}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {s.dateReturn}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">{s.client}</p>
                        <p className="text-xs text-gray-500">
                          {s.currentProduct.name} ({s.currentProduct.quantity}{" "}
                          unid.)
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.currentProduct.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                        {s.typeReturn}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Proveedor - estilos condicionales */}
                      <div>
                        {(() => {
                          const statusLabel = s.currentProduct.statusSuppliers || "Sin estado";
                          const normalizedStatus = statusLabel.toLowerCase();
                          const isNegativeStatus = normalizedStatus === "rechazado" || normalizedStatus === "n/a";
                          const statusKey = getStatusEditorKey(s.idReturn, s.currentProduct.idProduct);
                          const isLockedStatus = lockedSupplierStatuses.has(normalizedStatus);
                          const isDropdownOpen = activeStatusEditor === statusKey;
                          const badgeBaseClass = "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full";
                          const badgePaletteClass = isNegativeStatus ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700";
                          const badgeInteractiveClass = isLockedStatus ? "" : " cursor-pointer transition-shadow hover:shadow";
                          const badgeClassName = badgeBaseClass + " " + badgePaletteClass + badgeInteractiveClass;
                          return (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                className={badgeClassName}
                                onClick={() =>
                                  handleStatusClick(
                                    s.idReturn,
                                    s.currentProduct.idProduct,
                                    statusLabel
                                  )
                                }
                              >
                                {statusLabel}
                              </button>
                              {isDropdownOpen && (
                                <div className="absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                  <ul className="py-1">
                                    {supplierStatusOptions.map((option) => (
                                      <li key={option}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleStatusChange(
                                              s.idReturn,
                                              s.currentProduct.idProduct,
                                              option
                                            )
                                          }
                                          className={"w-full px-4 py-2 text-left text-sm " + (
                                            option === statusLabel
                                              ? "bg-green-50 text-green-700"
                                              : "text-gray-700 hover:bg-gray-100"
                                          )}
                                        >
                                          {option}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          ${s.currentProduct.price * s.currentProduct.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${s.currentProduct.price} c/u
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewDetailsButton event={() => handleViewDetails(s)} />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </motion.div>
        {/* Paginador */}
        <Paginator
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          filteredLength={filtered.length}
          goToPage={goToPage}
        />
      </div>

      {/* Modal de registro de devolución */}
      <ReturnSalesComponent
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      {/* Modal de detalles de devolución */}
      <DetailsClientReturn
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        returnData={selectedReturn}
      />
    </>
  );
}
