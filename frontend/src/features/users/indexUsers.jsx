// src/pages/users/indexUsers.jsx

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
import {
  showSuccessAlert,
} from "../../shared/components/alerts.jsx";

import { exportToExcel } from "./helper/exportToExcel.js";
import { exportToPdf } from "./helper/exportToPdf.js";

import DetailsUsers from "./detailsUsers";
import EditUsers from "./editUsers";
import RegisterUsers from "./registerUsers";
import DeleteUserModal from "./deleteUsers";

import { useUsuariosList } from "../../shared/components/hooks/users/useUserList";

// Clases utilitarias
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

export default function IndexUsers() {
  const { usuarios, setUsuarios, loading, error } = useUsuariosList();
  const users = usuarios || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // expansión móvil por id
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const original = document.body.style.overflow;
    if (isModalOpen || isDetailsOpen || isEditOpen || isDeleteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original || "auto";
    }
    return () => {
      document.body.style.overflow = original || "auto";
    };
  }, [isModalOpen, isDetailsOpen, isEditOpen, isDeleteOpen]);

  useEffect(() => {
    const openDetails = (e) => {
      setSelectedUser(e.detail);
      setIsDetailsOpen(true);
    };
    const openEdit = (e) => {
      setSelectedUser(e.detail);
      setIsEditOpen(true);
    };

    window.addEventListener("open-user-details", openDetails);
    window.addEventListener("open-user-edit", openEdit);

    return () => {
      window.removeEventListener("open-user-details", openDetails);
      window.removeEventListener("open-user-edit", openEdit);
    };
  }, []);

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
      Object.values(p).some((value) => normalizeText(String(value)).includes(s))
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

  const handleRegisterUser = (formData) => {
    const newUser = {
      id: Date.now(),
      Nombre: `${formData.nombre} ${formData.apellido}`,
      Correo: formData.correo,
      Documento: formData.documento,
      Telefono: formData.telefono,
      Rol: formData.rol,
      Estado: formData.estado ? "Activo" : "Inactivo",
    };
    setUsuarios((prev) => [newUser, ...(prev || [])]);
    showSuccessAlert("Usuario registrado correctamente");
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDelete = (userToDelete) => {
    setUsuarios((prev) => (prev || []).filter((user) => user.id !== userToDelete.id));
    showSuccessAlert("Usuario eliminado correctamente");
    setIsDeleteOpen(false);
    setUserToDelete(null);
    // ajustar página si hace falta
    const affects = filtered.some((u) => u.id === userToDelete.id);
    if (affects && pageItems.length === 1 && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleSaveUser = (updated) => {
    setUsuarios((prev) =>
      (prev || []).map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
    );
    showSuccessAlert("Usuario actualizado correctamente");
    setIsEditOpen(false);
    setSelectedUser(null);
  };

  const handleExportExcel = () => {
    exportToExcel(filtered, "usuarios", "Usuarios");
  };

  const handleExportPdf = () => {
    const headers = ["Nombre", "Correo", "Documento", "Teléfono", "Rol asignado", "Estado"];
    const dataToExport = filtered.map((user) => ({
      Nombre: user.Nombre,
      Correo: user.Correo,
      Documento: user.Documento,
      Telefono: user.Telefono,
      Rol: user.Rol,
      Estado: user.Estado,
    }));
    exportToPdf(dataToExport, headers, "Listado de Usuarios", "usuarios");
  };

  const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const rowVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 text-center">{typeof error === "string" ? error : "Error al cargar usuarios."}</p>
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
            <h2 className="text-2xl sm:text-3xl font-semibold">Gestión de Usuarios</h2>
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
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton event={handleExportExcel}>Excel</ExportExcelButton>
              <ExportPDFButton event={handleExportPdf}>PDF</ExportPDFButton>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "auto" });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
              >
                Registrar Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Móvil */}
          <motion.div className="md:hidden" variants={tableVariants} initial="hidden" animate="visible">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <span className="text-sm text-gray-600">Cargando usuarios...</span>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron usuarios.
              </div>
            ) : (
              <motion.ul className="space-y-3" variants={tableVariants}>
                {pageItems.map((u, i) => {
                  const isExpanded = expanded.has(u.id);
                  return (
                    <motion.li key={u.id + "-mobile-" + i} variants={rowVariants} className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleExpand(u.id)}
                        aria-expanded={isExpanded}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">ID {u.id}</span>
                              <span className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${u.Estado === "Activo" ? "bg-green-50 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {u.Estado}
                              </span>
                            </div>
                            <p className={"mt-1 text-base font-semibold text-gray-900 " + ONE_LINE_SAFE} title={u.Nombre}>
                              {u.Nombre}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 truncate">{u.Correo}</p>
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
                              <p className="text-[11px] uppercase tracking-wide text-gray-500">Documento</p>
                              <p className={LONG_TEXT_CLS + " mt-1 text-sm text-gray-800"}>{u.Documento || "—"}</p>

                              <div className="mt-3 flex items-center gap-2">
                                <ViewButton
                                  event={() => {
                                    setSelectedUser(u);
                                    setIsDetailsOpen(true);
                                  }}
                                />
                                <EditButton
                                  event={() => {
                                    setSelectedUser(u);
                                    setIsEditOpen(true);
                                  }}
                                />
                                <DeleteButton
                                  event={() => {
                                    openDeleteModal(u);
                                  }}
                                />
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
              <table className="min-w-[720px] lg:min-w-[960px] w-full md:table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Nombre</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Correo</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Documento</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Teléfono</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Rol asignado</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Estado</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <span className="text-sm text-gray-600">Cargando usuarios...</span>
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No se encontraron usuarios.</td>
                    </tr>
                  ) : (
                    pageItems.map((user) => (
                      <motion.tr key={user.id} className="hover:bg-gray-50" variants={rowVariants}>
                        <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">{user.Nombre}</td>
                        <td className="px-6 py-4 align-top text-sm text-green-700">{user.Correo}</td>
                        <td className="px-6 py-4 align-top text-sm text-gray-600">{user.Documento}</td>
                        <td className="px-6 py-4 align-top text-sm text-gray-600">{user.Telefono}</td>
                        <td className="px-6 py-4 align-top text-sm text-gray-600">{user.Rol}</td>
                        <td className="px-6 py-4 align-top">
                          {user.Estado === "Activo" ? (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">Activo</span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">Inactivo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <div className="inline-flex items-center gap-2">
                            <ViewButton
                              event={() =>
                                window.dispatchEvent(new CustomEvent("open-user-details", { detail: user }))
                              }
                            />
                            <EditButton
                              event={() =>
                                window.dispatchEvent(new CustomEvent("open-user-edit", { detail: user }))
                              }
                            />
                            <DeleteButton event={() => openDeleteModal(user)} />
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

      {/* Modales */}
      <RegisterUsers isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRegister={handleRegisterUser} />
      <DetailsUsers isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} user={selectedUser} />
      <EditUsers isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={selectedUser} onSave={handleSaveUser} />
      <DeleteUserModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} user={userToDelete} />
    </div>
  );
}