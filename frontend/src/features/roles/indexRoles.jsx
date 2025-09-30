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
import DeleteRoleModal from "./deleteRoles";
import RegisterRoles from "./registerRoles";
import { showSuccessAlert } from "../../shared/components/alerts.jsx";

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
      Estado: "Inactivo",
    },
  ]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

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

  // Bloquear scroll del body cuando CUALQUIER modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen || isDetailsOpen || isEditOpen || isDeleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isModalOpen, isDetailsOpen, isEditOpen, isDeleteModalOpen]);

  // --- Formulario Crear Rol ---
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

  const handlePermisoChange = (modulo, permiso) => {
    const key = `${modulo}-${permiso}`;
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

    const nuevoRol = {
      NombreRol: form.nombreRol,
      Descripción: form.descripcion,
      Estado: form.estado ? "Activo" : "Inactivo",
      Permisos: Object.entries(form.permisos)
        .filter(([_, checked]) => checked)
        .map(([key]) => {
          const [modulo, permiso] = key.split("-");
          return { modulo, permiso };
        }),
    };

    setRoles((prev) => [nuevoRol, ...prev]); // ✅ lo agrega al inicio de la tabla
    setIsModalOpen(false);

    // Limpiar formulario
    setForm({
      nombreRol: "",
      descripcion: "",
      estado: true,
      permisos: {},
    });

    showSuccessAlert("Rol creado correctamente.");
  };

  // --- Permisos disponibles agrupados ---
  const permisosAgrupados = {
    "Gestión Roles": ["Crear", "Leer", "Editar", "Eliminar"],
    "Gestión Usuarios": ["Crear", "Leer", "Editar", "Eliminar"],
    "Gestión Productos": ["Crear", "Leer", "Editar", "Eliminar"],
    "Gestión Categorías": ["Crear", "Leer", "Editar", "Eliminar"],
    "Gestión Proveedores": ["Crear", "Leer", "Editar", "Eliminar"],
  };

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
      Object.values(p).some((value) =>
        normalizeText(String(value)).includes(s)
      )
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

  const handleUpdateRole = (updatedRole) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.NombreRol === selectedRole.NombreRol ? updatedRole : r
      )
    );
    setSelectedRole(updatedRole);
  };

  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRole = (roleToDelete) => {
    setRoles((prev) =>
      prev.filter((role) => role.NombreRol !== roleToDelete.NombreRol)
    );
    showSuccessAlert("Rol eliminado correctamente.");
  };

  // Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.02 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.02 } },
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

        {/* Tabla */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          key={currentPage}
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Nombre del rol</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
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
                  pageItems.map((role, i) => (
                    <motion.tr
                      key={role.NombreRol}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={i}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {role.NombreRol}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-700">
                        {role.Descripción}
                      </td>
                      <td className="px-6 py-4">
                        {role.Estado === "Activo" ? (
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
                          <button
                            type="button"
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("open-role-details", {
                                  detail: role,
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
                                new CustomEvent("open-role-edit", {
                                  detail: role,
                                })
                              )
                            }
                            className="rounded"
                          >
                            <EditButton />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(role)}
                            className="rounded"
                          >
                            <DeleteButton />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
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
      <RegisterRoles
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handlePermisoChange={handlePermisoChange}
        handleSubmit={handleSubmit}
        permisosAgrupados={permisosAgrupados}
      />

      {/* Otros modales */}
      <DetailsRoles
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        role={selectedRole}
      />
      <EditRoles
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        role={selectedRole}
        permisosDisponibles={permisosAgrupados}
        onUpdate={handleUpdateRole}
      />
      <DeleteRoleModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRole}
        role={roleToDelete}
      />

      <style jsx>{`
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
