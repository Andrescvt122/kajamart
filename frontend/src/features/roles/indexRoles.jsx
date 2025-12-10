import React, { useMemo, useState, useEffect } from "react";
import { ViewButton, EditButton, DeleteButton } from "../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import { motion, AnimatePresence } from "framer-motion";
import DetailsRoles from "./detailsRoles";
import EditRoles from "./editRoles";
import DeleteRoleModal from "./deleteRoles.jsx";
import RegisterRoles from "./registerRoles";
import { usePermisosList } from "../../shared/components/hooks/roles/usePermisosList.js";
import { useRolesList } from "../../shared/components/hooks/roles/useRolesList.js";

const ONE_LINE_SAFE = "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";
const LONG_TEXT_CLS = "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";

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

export default function IndexRoles() {
  const {
    roles,
    loading,
    error,
    addRole,
    updateRoleInState,
    deleteRoleInState,
  } = useRolesList();

  const { permisosAgrupados, loading: loadingPermisos } = usePermisosList();

  const [selectedRole, setSelectedRole] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // expansión móvil
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    document.body.style.overflow =
      isModalOpen || isDetailsOpen || isEditOpen || isDeleteModalOpen
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, isDetailsOpen, isEditOpen, isDeleteModalOpen]);

  const handleRoleCreated = (newRole) => {
    addRole(newRole);
    setSelectedRole(newRole);
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const handleRoleUpdated = (updatedRole) => {
    updateRoleInState(updatedRole);
    setIsEditOpen(false);
    setSelectedRole(null);
  };

  const handleRoleDeleted = (roleId) => {
    deleteRoleInState(roleId);
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
    // ajustar página si hace falta
    const affects = roles.some((r) => r.rol_id === roleId || r.id === roleId);
    if (affects && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const openDetailsModal = (role) => {
    setSelectedRole(role);
    setIsDetailsOpen(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setIsEditOpen(true);
  };

  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

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

  const goToPage = (n) => setCurrentPage(Math.min(Math.max(1, n), totalPages));

  const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const rowVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 text-center">{typeof error === "string" ? error : "Error al cargar roles."}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <div
        className="absolute bottom-0 inset-x-0 w-full pointer-events-none overflow-x-clip"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      >
        <div className="h-full w-full" />
      </div>

      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">Gestión de Roles</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Administrador de tienda</p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="w-full min-w-0">
              <div className="relative">
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
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end min-w-0">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "auto" });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
              >
                Registrar Nuevo Rol
              </button>
            </div>
          </div>

          {/* Móvil */}
          <motion.div className="md:hidden" variants={tableVariants} initial="hidden" animate="visible">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <span className="text-sm text-gray-600">Cargando roles...</span>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">No se encontraron roles.</div>
            ) : (
              <motion.ul className="space-y-3" variants={tableVariants}>
                {pageItems.map((role, i) => {
                  const id = role.rol_id ?? role.id ?? i;
                  const isExpanded = expanded.has(id);
                  return (
                    <motion.li key={id + "-mobile-" + i} variants={rowVariants} className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleExpand(id)}
                        aria-expanded={isExpanded}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">ID {id}</span>
                              <span className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${role.estado_rol ? "bg-green-50 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {role.estado_rol ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <p className={"mt-1 text-base font-semibold text-gray-900 " + ONE_LINE_SAFE} title={role.rol_nombre || role.nombre}>
                              {role.rol_nombre || role.nombre || "—"}
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
                            transition={{ duration: 0.32 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="px-4 py-4">
                              <p className="text-[11px] uppercase tracking-wide text-gray-500">Descripción</p>
                              <p className={LONG_TEXT_CLS + " mt-1 text-sm text-gray-800"}>{role.descripcion || "Sin descripción"}</p>

                              <div className="mt-4 flex items-center gap-2">
                                <ViewButton event={() => openDetailsModal(role)} />
                                <EditButton event={() => openEditModal(role)} />
                                <DeleteButton event={() => openDeleteModal(role)} />
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
          <motion.div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100" variants={tableVariants} initial="hidden" animate="visible">
            <div className="overflow-x-auto max-w-full">
              <table className="min-w-[720px] lg:min-w-[860px] w-full md:table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Nombre del rol</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Descripción</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Estado</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center"><span className="text-sm text-gray-600">Cargando roles...</span></td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No se encontraron roles.</td>
                    </tr>
                  ) : (
                    pageItems.map((role, i) => (
                      <motion.tr key={role.rol_id ?? role.id ?? i} className="hover:bg-gray-50" variants={rowVariants}>
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{role.rol_nombre || role.nombre || "—"}</td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">{role.descripcion || role.rol_descripcion || "Sin descripción"}</td>
                        <td className="px-4 lg:px-6 py-4">
                          {role.estado_rol ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">Activo</span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">Inactivo</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button type="button" onClick={() => openDetailsModal(role)} className="p-1 rounded-md hover:bg-gray-100" title="Ver detalles"><ViewButton /></button>
                            <button type="button" onClick={() => openEditModal(role)} className="p-1 rounded-md hover:bg-gray-100" title="Editar"><EditButton /></button>
                            <button type="button" onClick={() => openDeleteModal(role)} className="p-1 rounded-md hover:bg-gray-100" title="Eliminar"><DeleteButton /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </table>
            </div>
          </motion.div>

          <div className="mt-4 sm:mt-6">
            <Paginator currentPage={currentPage} perPage={perPage} totalPages={totalPages} filteredLength={filtered.length} goToPage={goToPage} />
          </div>
        </div>
      </div>

      {/* MODALES */}
      <RegisterRoles isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} permisosAgrupados={permisosAgrupados} onRoleCreated={handleRoleCreated} />

      <DetailsRoles isOpen={isDetailsOpen} onClose={() => { setIsDetailsOpen(false); setSelectedRole(null); }} role={selectedRole} />

      <EditRoles isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedRole(null); }} role={selectedRole} onRoleUpdated={handleRoleUpdated} />

      <DeleteRoleModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setRoleToDelete(null); }} role={roleToDelete} onRoleDeleted={handleRoleDeleted} />
    </div>
  );
}
