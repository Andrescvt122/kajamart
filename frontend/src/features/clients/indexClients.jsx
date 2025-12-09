// IndexClients.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Swal from "sweetalert2";
import Paginator from "../../shared/components/paginator";
import {
  ExportExcelButton,
  ExportPDFButton,
  ViewButton,
  EditButton,
  DeleteButton,
} from "../../shared/components/buttons";
import RegisterClientModal from "./RegisterClientModal";
import ClientDetailModal from "./ClientDetailModal";
import { exportToXls } from "./helpers/exportToXls.js";
import { exportToPdf } from "./helpers/exportToPdf.js";
import { useGetClients } from "../../shared/components/hooks/clients/useGetClients";
import { useClientDelete } from "../../shared/components/hooks/clients/useDeleteClient";

// ✅ ID fijo del Cliente de Caja (coincide con backend)
const CAJA_ID = 0;

// Icono chevron para acordeón móvil
function ChevronIcon({ open }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="text-gray-500"
    >
      <path
        d="M5.5 7.5l4.5 4 4.5-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export default function IndexClients() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    activo: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const tipoOptions = [
    { label: "Cédula de Ciudadanía", value: "CC" },
    { label: "Tarjeta de Identidad", value: "TI" },
    { label: "Cédula de Extranjería", value: "CE" },
    { label: "NIT", value: "NIT" },
  ];

  const { data, loading, error, refetch } = useGetClients();
  const { deleteClient: deleteClientHook } = useClientDelete();

  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ✅ Cliente de Caja (por ID y por nombre como respaldo)
  const isClienteCaja = (client) => {
    if (!client) return false;
    if (String(client.id) === String(CAJA_ID)) return true;
    const n = String(client.nombre || "").toLowerCase().trim();
    return n === "cliente de caja";
  };

  const allClients = useMemo(() => {
    const backendArray = Array.isArray(data) ? data : [];

    const adapted = backendArray.map((client) => {
      const idApi = client.id_cliente ?? client.id;
      const nombre = client.nombre_cliente ?? client.nombre ?? "";

      const esCaja =
        String(idApi) === String(CAJA_ID) ||
        (typeof nombre === "string" &&
          nombre.toLowerCase().trim() === "cliente de caja");

      let activo;
      if (esCaja) {
        activo = true;
      } else if (typeof client.estado_cliente === "boolean") {
        activo = client.estado_cliente;
      } else {
        const rawEstado = client.estado_cliente ?? client.activo ?? "";
        activo =
          rawEstado === true ||
          String(rawEstado).toLowerCase().trim() === "activo";
      }

      return {
        id: idApi,
        nombre,
        tipoDocumento: client.tipo_docume ?? client.tipoDocumento ?? "",
        numeroDocumento: client.numero_doc ?? client.numeroDocumento ?? "",
        correo: client.correo_cliente ?? client.correo ?? "",
        telefono: client.telefono_cliente ?? client.telefono ?? "",
        activo,
        fecha: client.fecha ?? new Date().toISOString().split("T")[0],
      };
    });

    // ✅ Garantizar que Caja esté primero SIEMPRE
    const caja = adapted.find((c) => String(c.id) === String(CAJA_ID));
    const sinCaja = adapted.filter((c) => String(c.id) !== String(CAJA_ID));
    return caja ? [caja, ...sinCaja] : adapted;
  }, [data]);

  const normalizeText = (text) =>
    String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    let result = allClients;

    if (s) {
      result = result.filter((c) =>
        Object.values(c).some((value) => normalizeText(value).includes(s))
      );
    }

    // ✅ Orden: Caja primero, luego por ID
    return result.sort((a, b) => {
      const aCaja = String(a.id) === String(CAJA_ID);
      const bCaja = String(b.id) === String(CAJA_ID);
      if (aCaja && !bCaja) return -1;
      if (!aCaja && bCaja) return 1;

      const numA = typeof a.id === "string" ? parseInt(a.id, 10) : a.id;
      const numB = typeof b.id === "string" ? parseInt(b.id, 10) : b.id;
      return (numA || 0) - (numB || 0);
    });
  }, [allClients, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  const editClient = (client) => {
    if (isClienteCaja(client)) {
      Swal.fire({
        icon: "warning",
        title: "Cliente de Caja",
        text: "El Cliente de Caja no se puede editar.",
        confirmButtonColor: "#fbbf24",
      });
      return;
    }

    setForm({
      nombre: client.nombre,
      tipoDocumento: client.tipoDocumento,
      numeroDocumento: client.numeroDocumento,
      correo: client.correo,
      telefono: client.telefono,
      activo: client.activo,
    });
    setEditingClientId(client.id);
    setIsModalOpen(true);
  };

  const deleteClient = async (client) => {
    if (isClienteCaja(client)) {
      Swal.fire({
        icon: "error",
        title: "Cliente de Caja",
        text: "El Cliente de Caja no se puede eliminar.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    const id = client.id;

    const result = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const success = await deleteClientHook(id);
      if (success) {
        refetch();
        Swal.fire("Eliminado", "Cliente eliminado correctamente", "success");
      } else {
        Swal.fire("Error", "No se pudo eliminar el cliente", "error");
      }
    }
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <div
          className="absolute bottom-0 inset-x-0 w-full pointer-events-none overflow-x-clip"
          style={{
            height: "50%",
            backgroundImage: `url(${ondas})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
            backgroundSize: "cover",
            transform: "scaleX(1.15)",
            zIndex: 0,
          }}
        >
          <div className="h-full w-full" />
        </div>

        <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
          <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold">Clientes</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Listado de clientes
              </p>
            </div>

            <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
              <div className="relative w-full min-w-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 pr-4 py-2.5 sm:py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 text-sm"
                />
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <ExportExcelButton
                  event={() =>
                    exportToXls(
                      allClients.map((c) => ({
                        ...c,
                        correo: c.correo?.trim() || "N/A",
                        telefono: c.telefono?.trim() || "N/A",
                      }))
                    )
                  }
                >
                  Excel
                </ExportExcelButton>

                <ExportPDFButton
                  event={() =>
                    exportToPdf(
                      allClients.map((c) => ({
                        ...c,
                        correo: c.correo?.trim() || "N/A",
                        telefono: c.telefono?.trim() || "N/A",
                      }))
                    )
                  }
                >
                  PDF
                </ExportPDFButton>

                <button
                  onClick={() => {
                    setForm({
                      nombre: "",
                      tipoDocumento: "",
                      numeroDocumento: "",
                      correo: "",
                      telefono: "",
                      activo: true,
                    });
                    setEditingClientId(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2.5 sm:py-2 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm w-full sm:w-auto"
                >
                  Registrar Cliente
                </button>
              </div>
            </div>

            {/* Móvil */}
            <motion.div
              className="md:hidden"
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              {pageItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                  No se encontraron clientes.
                </div>
              ) : (
                <motion.ul className="space-y-3" variants={tableVariants}>
                  {pageItems.map((c, i) => {
                    const isExpanded = expanded.has(c.id);
                    const isActive = isClienteCaja(c) ? true : c.activo;

                    return (
                      <motion.li
                        key={c.id + "-mobile-" + i}
                        variants={rowVariants}
                        className="bg-white rounded-xl shadow-sm border border-gray-100"
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpand(c.id)}
                          aria-expanded={isExpanded}
                          className="w-full p-4 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                  ID {c.id}
                                </span>
                                <span
                                  className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${
                                    isActive
                                      ? "bg-green-50 text-green-700"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {isActive ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                              <p
                                className="mt-1 text-base font-semibold text-gray-900 truncate"
                                title={c.nombre}
                              >
                                {c.nombre}
                              </p>
                            </div>
                            <ChevronIcon open={isExpanded} />
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, y: -4 }}
                              animate={{ height: "auto", opacity: 1, y: 0 }}
                              exit={{ height: 0, opacity: 0, y: -2 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden border-t border-gray-100"
                            >
                              <div className="px-4 py-4 space-y-2 text-sm">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                    Documento
                                  </p>
                                  <p className="text-gray-800 break-words">
                                    {c.tipoDocumento} {c.numeroDocumento}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                    Correo
                                  </p>
                                  <p className="text-gray-800 break-words">
                                    {c.correo?.trim() ? c.correo : "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                    Teléfono
                                  </p>
                                  <p className="text-gray-800 break-words">
                                    {c.telefono?.trim() ? c.telefono : "N/A"}
                                  </p>
                                </div>
                                <div className="pt-2 flex items-center gap-2">
                                  <ViewButton event={() => handleView(c)} />
                                  <EditButton event={() => editClient(c)} />
                                  <DeleteButton event={() => deleteClient(c)} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </motion.div>

            {/* Desktop */}
            <motion.div
              className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="overflow-x-auto max-w-full">
                <table key={currentPage} className="min-w-[800px] w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Documento</th>
                      <th className="px-4 py-3">Correo</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                          No se encontraron clientes.
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((c, i) => {
                        const isActive = isClienteCaja(c) ? true : c.activo;

                        return (
                          <motion.tr
                            key={c.id + "-" + i}
                            className="hover:bg-gray-50"
                            variants={rowVariants}
                          >
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {c.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {c.nombre}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {c.tipoDocumento} {c.numeroDocumento}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {c.correo?.trim() ? c.correo : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {c.telefono?.trim() ? c.telefono : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                                  isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isActive ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {c.fecha}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <ViewButton event={() => handleView(c)} />
                                <EditButton event={() => editClient(c)} />
                                <DeleteButton event={() => deleteClient(c)} />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </motion.tbody>
                </table>
              </div>
            </motion.div>

            <div className="mt-4 sm:mt-6">
              <Paginator
                currentPage={currentPage}
                perPage={perPage}
                totalPages={totalPages}
                filteredLength={filtered.length}
                goToPage={goToPage}
              />
            </div>
          </div>
        </div>

        <RegisterClientModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          setForm={setForm}
          tipoOptions={tipoOptions}
          onClose={() => setIsModalOpen(false)}
          title={editingClientId ? "Editar Cliente" : "Registrar Cliente"}
          editingClientId={editingClientId}
          onSuccess={() => {
            refetch();
            setIsModalOpen(false);
            setEditingClientId(null);
          }}
        />

        <ClientDetailModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          client={selectedClient}
        />
      </div>
    </>
  );
}
