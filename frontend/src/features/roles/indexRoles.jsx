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

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.02 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06 },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.12 } },
  };

  return (
    <>
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Gestión de Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Administrador de tienda</p>
          </div>
        </div>

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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar Nuevo Rol
            </button>
          </div>
        </div>

        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="table-scroll">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Nombre del rol</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      Cargando roles...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No se encontraron roles.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((role, i) => (
                    <motion.tr
                      key={role.rol_id ?? role.id ?? i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={i}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {role.rol_nombre || role.nombre || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {role.descripcion || role.rol_descripcion || "Sin descripción"}
                      </td>
                      <td className="px-6 py-4">
                        {role.estado_rol ? (
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
                            onClick={() => openDetailsModal(role)}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Ver detalles"
                          >
                            <ViewButton />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Editar"
                          >
                            <EditButton />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(role)}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Eliminar"
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
          </div>
        </motion.div>

        <div className="mt-4">
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>

        {/* MODALES */}
        <RegisterRoles
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          permisosAgrupados={permisosAgrupados}
          onRoleCreated={handleRoleCreated}
        />

        <DetailsRoles
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />

        <EditRoles
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          onRoleUpdated={handleRoleUpdated}
        />

        <DeleteRoleModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
          }}
          role={roleToDelete}
          onRoleDeleted={handleRoleDeleted}
        />
      </div>
    </>
  );
}
