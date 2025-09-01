import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/buttons";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/paginator";
import { motion } from "framer-motion";

export default function IndexUsers() {
  const [users] = useState([
    {
      Nombre: "Sophia Clark",
      Correo: "sophia.clark@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-01-15",
    },
    {
      Nombre: "Sophia Clark",
      Correo: "sophia.clark@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-01-15",
    },
    {
      Nombre: "Sophia Clark",
      Correo: "sophia.clark@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-01-15",
    },
    {
      Nombre: "Sophia Clark",
      Correo: "sophia.clark@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-01-15",
    },
    {
      Nombre: "Sophia Clark",
      Correo: "sophia.clark@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-01-15",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // 🔑 Normalizar texto (quita tildes, mayúsculas, etc.)
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return users;

    return users.filter((p) =>
      Object.values(p).some((value) => normalizeText(value).includes(s))
    );
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 🎬 Variantes de animación
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
    <div className="flex min-h-screen">
      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
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

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Gestión de Usuarios</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de tienda
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
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
                onClick={() => console.log("Registrar nuevo usuario")}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Tabla con animación */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            key={currentPage} // 👈 cambia la animación en cada paginación
          >
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Rol asignado</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha creación</th>
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
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((s, i) => (
                    <motion.tr
                      key={s.nit + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">
                        {s.Nombre}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-green-700">
                        {s.Correo}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {s.Rol}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {s.Estado === "Activo" ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {s.FechaCreacion}
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton />
                          <EditButton />
                          <DeleteButton />
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
      </div>
    </div>
  );
}
