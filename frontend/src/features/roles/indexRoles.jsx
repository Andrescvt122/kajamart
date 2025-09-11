// src/pages/roles/IndexRoles.jsx

import React, { useMemo, useState, useEffect } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import { motion, AnimatePresence } from "framer-motion";
import DetailsRoles from "./detailsRoles";
import EditRoles from "./editRoles";

export default function IndexRoles() {
  const [roles, setRoles] = useState([
    {
      NombreRol: "Administrador",
      Descripción: "Administra todos los aspectos del sistema",
      Estado: "Activo",
      Permisos: [
        { modulo: "Gestión Roles", permiso: "Crear" },
        { modulo: "Gestión Roles", permiso: "Leer" },
      ],
    },
    {
      NombreRol: "Empleado",
      Descripción: "Puede crear y editar contenido",
      Estado: "Activo",
    },
    {
      NombreRol: "Cliente",
      Descripción: "Puede ingresar y comprar productos",
      Estado: "Activo",
    },
  ]);

  // nuevo: estado para modales por eventos
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const openDetails = (e) => {
      setSelectedRole(e.detail);
      setIsDetailsOpen(true);
    };
    const openEdit = (e) => {
      setSelectedRole(e.detail);
      setIsEditOpen(true);
    };

    window.addEventListener("open-role-details", openDetails);
    window.addEventListener("open-role-edit", openEdit);

    return () => {
      window.removeEventListener("open-role-details", openDetails);
      window.removeEventListener("open-role-edit", openEdit);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const perPage = 6;

  // --- Formulario de modal ---
  const [form, setForm] = useState({
    nombreRol: "",
    descripcion: "",
    estado: true,
    permisos: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermisoChange = (key) => {
    setForm((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [key]: !prev.permisos[key],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Rol creado:", form);
    setIsModalOpen(false);
  };

  // --- Permisos disponibles ---
  const permisosDisponibles = [
    { modulo: "Gestión Roles", permiso: "Crear" },
    { modulo: "Gestión Roles", permiso: "Leer" },
    { modulo: "Gestión Roles", permiso: "Editar" },
    { modulo: "Gestión Roles", permiso: "Eliminar" },
    { modulo: "Gestión Usuarios", permiso: "Crear" },
    { modulo: "Gestión Usuarios", permiso: "Leer" },
    { modulo: "Gestión Usuarios", permiso: "Editar" },
    { modulo: "Gestión Usuarios", permiso: "Eliminar" },
    { modulo: "Gestión Productos", permiso: "Crear" },
    { modulo: "Gestión Productos", permiso: "Leer" },
    { modulo: "Gestión Productos", permiso: "Editar" },
    { modulo: "Gestión Productos", permiso: "Eliminar" },
    { modulo: "Gestión Categorías", permiso: "Crear" },
    { modulo: "Gestión Categorías", permiso: "Leer" },
    { modulo: "Gestión Categorías", permiso: "Editar" },
    { modulo: "Gestión Categorías", permiso: "Eliminar" },
    { modulo: "Gestión Proveedores", permiso: "Crear" },
    { modulo: "Gestión Proveedores", permiso: "Leer" },
    { modulo: "Gestión Proveedores", permiso: "Editar" },
    { modulo: "Gestión Proveedores", permiso: "Eliminar" },
  ];

  // --- Paginación y búsqueda ---
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return roles;
    return roles.filter((p) =>
      Object.values(p).some((value) => normalizeText(value).includes(s))
    );
  }, [roles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // handler actualizado desde modal de editar
  const handleUpdateRole = (updatedRole) => {
    setRoles((prev) =>
      prev.map((r) => (r.NombreRol === updatedRole.NombreRol ? updatedRole : r))
    );
  };

  // --- Animaciones tabla ---
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
      {/* Fondo decorativo */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.00)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Gestión de Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Administrador de tienda</p>
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
              placeholder="Buscar roles..."
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
              Registrar Nuevo Rol
            </button>
          </div>
        </div>

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          key={currentPage}
        >
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Nombre del rol</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Estado</th>
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
                    No se encontraron roles.
                  </td>
                </tr>
              ) : (
                pageItems.map((s, i) => (
                  <motion.tr
                    key={i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.NombreRol}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {s.Descripción}
                    </td>
                    <td className="px-6 py-4">
                      {s.Estado === "Activo" ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                          Activo
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* ahora emitir eventos; el componente principal escucha y abre modal */}
                        <button
                          type="button"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("open-role-details", {
                                detail: s,
                              })
                            )
                          }
                          className="rounded"
                        >
                          <ViewButton />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("open-role-edit", { detail: s })
                            )
                          }
                          className="rounded"
                        >
                          <EditButton />
                        </button>

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

      {/* MODAL CREAR ROL */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Fondo */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            {/* Contenedor */}
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -30 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">Crear Rol</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Formulario */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scroll"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 },
                    },
                  }}
                >
                  {/* Nombre y Descripción */}
                  <motion.div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del rol
                      </label>
                      <input
                        type="text"
                        name="nombreRol"
                        value={form.nombreRol}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-300 focus:outline-none"
                        placeholder="Nombre del rol"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-300 focus:outline-none"
                        rows={3}
                        placeholder="Descripción del rol"
                      />
                    </div>
                  </motion.div>

                  {/* Estado */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Estado del Rol
                    </span>
                    <span
                      className={`text-sm ${
                        form.estado ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {form.estado ? "Activo" : "Inactivo"}
                    </span>
                    <label className="inline-flex relative items-center cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={form.estado}
                        onChange={() =>
                          setForm((prev) => ({ ...prev, estado: !prev.estado }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>

                  {/* Permisos */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Asignar Permisos y privilegios
                    </h3>
                    <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                      <table className="min-w-full text-sm">
                        <thead className="bg-green-50 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left">Módulo</th>
                            <th className="px-4 py-3 text-left">
                              Permiso/privilegio
                            </th>
                            <th className="px-4 py-3 text-center">Asignación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {permisosDisponibles.map((p, i) => {
                            const key = `${p.modulo}-${p.permiso}`;
                            return (
                              <tr key={i}>
                                <td className="px-4 py-3 text-gray-900">
                                  {p.modulo}
                                </td>
                                <td className="px-4 py-3 text-green-600">
                                  {p.permiso}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={form.permisos[key] || false}
                                    onChange={() => handlePermisoChange(key)}
                                    className="custom-checkbox"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                    >
                      Crear Rol
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DETALLES (escucha evento) */}
      <DetailsRoles
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        role={selectedRole}
      />

      {/* MODAL EDITAR (escucha evento) */}
      <EditRoles
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        role={selectedRole}
        permisosDisponibles={permisosDisponibles}
        onUpdate={handleUpdateRole}
      />

      {/* Estilos personalizados */}
      <style jsx>{`
        /* Scrollbar blanco */
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #fff;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }
        /* Checkbox personalizado */
        .custom-checkbox {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #ccc;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .custom-checkbox:checked {
          background-color: #fff;
          border-color: #22c55e;
        }
        .custom-checkbox:checked::after {
          content: "✔";
          color: #22c55e;
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>
    </>
  );
}
