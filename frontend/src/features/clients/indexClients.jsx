// IndexClients.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import RegisterClientModal from "./RegisterClientModal";

export default function IndexClients() {
  // Cliente fijo de caja
  const clienteCaja = {
    id: "C000",
    nombre: "Cliente de Caja",
    tipoDocumento: "N/A",
    numeroDocumento: "N/A",
    correo: "caja@correo.com",
    telefono: "N/A",
    estado: "Activo",
    fecha: new Date().toISOString().split("T")[0],
  };

  // ✅ Estado inicial: leer de localStorage
  const [clients, setClients] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("clientes")) || [];
    // Garantizar siempre que exista Cliente de Caja
    if (!stored.some((c) => c.id === "C000")) {
      const updated = [clienteCaja, ...stored];
      localStorage.setItem("clientes", JSON.stringify(updated));
      return updated;
    }
    return stored;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoOpen, setTipoOpen] = useState(false);
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

  // ✅ Guardar en localStorage cada vez que cambien los clientes
  useEffect(() => {
    localStorage.setItem("clientes", JSON.stringify(clients));
  }, [clients]);

  // ✅ Agregar cliente con ID incremental
  const addClient = (newClient) => {
    const nextIdNumber = clients.length;
    const nextId = `C${String(nextIdNumber).padStart(3, "0")}`;
    const clientWithId = {
      ...newClient,
      id: nextId,
      estado: newClient.activo ? "Activo" : "Inactivo",
      fecha: new Date().toISOString().split("T")[0],
    };
    setClients((prev) => [...prev, clientWithId]);
    setForm({
      nombre: "",
      tipoDocumento: "",
      numeroDocumento: "",
      correo: "",
      telefono: "",
      activo: true,
    });
    setIsModalOpen(false);
  };

  // Normalización de búsqueda
  const normalizeText = (text) =>
    String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // ✅ Filtrar clientes
  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return clients;
    return clients.filter((c) =>
      Object.values(c).some((value) => normalizeText(value).includes(s))
    );
  }, [clients, searchTerm]);

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

  // ✅ Editar cliente
  const editClient = (client) => {
    setForm({
      nombre: client.nombre,
      tipoDocumento: client.tipoDocumento,
      numeroDocumento: client.numeroDocumento,
      correo: client.correo,
      telefono: client.telefono,
      activo: client.estado === "Activo",
    });
    setIsModalOpen(true);
  };

  // ✅ Eliminar cliente (excepto caja)
  const deleteClient = (id) => {
    if (id === "C000") return; // no borrar Cliente de Caja
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

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

      {/* Contenedor principal */}
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Header */}
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
            <ExportExcelButton>Excel</ExportExcelButton>
            <ExportPDFButton>PDF</ExportPDFButton>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar Cliente
            </button>
          </div>
        </div>

        {/* Tabla de clientes */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
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
                    <td className="px-6 py-4 text-sm text-gray-600">{c.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {c.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.numeroDocumento}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.correo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.telefono}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                          c.estado === "Activo"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.fecha}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewButton />
                        <EditButton
                          onClick={() => c.id !== "C000" && editClient(c)}
                          disabled={c.id === "C000"}
                        />
                        <DeleteButton
                          onClick={() => deleteClient(c.id)}
                          disabled={c.id === "C000"}
                        />
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

        {/* Modal de registro */}
        <RegisterClientModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          setForm={setForm}
          tipoOptions={tipoOptions}
          tipoOpen={tipoOpen}
          setTipoOpen={setTipoOpen}
          addClient={addClient}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
}
