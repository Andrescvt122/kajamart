// IndexClients.jsx
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
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

// ID reservado en la BD para el Cliente de Caja
const CAJA_ID = 1;

export default function IndexClients() {
  // Estados
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

  // Hooks para obtener y eliminar clientes
  const { data, loading, error, refetch } = useGetClients();
  const { deleteClient: deleteClientHook } = useClientDelete();

  // 👉 Helper para saber si un cliente es el Cliente de Caja
  const isClienteCaja = (client) => {
    if (!client) return false;
    const byId = client.id === CAJA_ID;
    const byName =
      typeof client.nombre === "string" &&
      client.nombre.toLowerCase().trim() === "cliente de caja";
    return byId || byName;
  };

  // Adaptar clientes del backend al modelo del front
  const allClients = useMemo(() => {
    const backendArray = Array.isArray(data) ? data : [];

    const adaptedBackendClients = backendArray.map((client) => {
      const idApi = client.id_cliente ?? client.id;

      return {
        id: idApi,
        nombre: client.nombre_cliente ?? client.nombre ?? "",
        tipoDocumento: client.tipo_docume ?? client.tipoDocumento ?? "",
        numeroDocumento: client.numero_doc ?? client.numeroDocumento ?? "",
        correo: client.correo_cliente ?? client.correo ?? "",
        telefono: client.telefono_cliente ?? client.telefono ?? "",
        activo:
          typeof client.estado_cliente === "boolean"
            ? client.estado_cliente
            : (client.estado_cliente ?? client.activo) === "Activo",
        fecha: client.fecha ?? new Date().toISOString().split("T")[0],
      };
    });

    return adaptedBackendClients;
  }, [data]);

  // Normalización de búsqueda
  const normalizeText = (text) =>
    String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Filtrar + ordenar clientes
  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    let result = allClients;
    if (s) {
      result = result.filter((c) =>
        Object.values(c).some((value) => normalizeText(value).includes(s))
      );
    }
    return result.sort((a, b) => {
      const numA =
        typeof a.id === "string" ? parseInt(a.id.replace("C", ""), 10) : a.id;
      const numB =
        typeof b.id === "string" ? parseInt(b.id.replace("C", ""), 10) : b.id;
      return numA - numB;
    });
  }, [allClients, searchTerm]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  // Editar cliente
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

  // Eliminar cliente
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
        refetch(); // Actualizar lista
        Swal.fire("Eliminado", "Cliente eliminado correctamente", "success");
      } else {
        Swal.fire("Error", "No se pudo eliminar el cliente", "error");
      }
    }
  };

  // Ver detalles
  const handleView = (client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  // Loading / error
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
      {/* Fondo ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col p-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Clientes</h2>
            <p className="text-sm text-gray-500 mt-1">Listado de clientes</p>
          </div>
        </div>

        {/* Barra búsqueda + botones */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
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
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {/* Exportar a Excel */}
           {/* Exportar a Excel */}
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

      {/* Exportar a PDF */}
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
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar Cliente
            </button>
          </div>
        </div>

        {/* Tabla */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-6xl mx-auto"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          style={{ fontSize: "0.9rem" }}
        >
          <table key={currentPage} className="min-w-full">
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

            <motion.tbody
              className="divide-y divide-gray-100"
              variants={tableVariants}
            >
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                pageItems.map((c, i) => (
                  <motion.tr
                    key={c.id + "-" + i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {c.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
                          c.activo
                            ? "bg-green-50 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
                ))
              )}
            </motion.tbody>
          </table>
        </motion.div>

        {/* Paginación */}
        <Paginator
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          filteredLength={filtered.length}
          goToPage={goToPage}
        />

        {/* Modal de registro / edición */}
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

        {/* Modal de detalles */}
        <ClientDetailModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          client={selectedClient}
        />
      </div>
    </>
  );
}
