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
import { motion } from "framer-motion";
import {
  showSuccessAlert,
} from "../../shared/components/alerts.jsx";

// Importar helpers de exportación
import { exportToExcel } from "./helper/exportToExcel.js";
import { exportToPdf } from "./helper/exportToPdf.js";

// Importar modales
import DetailsUsers from "./detailsUsers";
import EditUsers from "./editUsers";
import RegisterUsers from "./registerUsers";
import DeleteUserModal from "./deleteUsers";

// Importar hook
import { useUsuariosList } from "../../shared/components/hooks/users/useUserList";

export default function IndexUsers() {
  // Usar hook centralizado
  const { usuarios, setUsuarios, loading, error } = useUsuariosList();
  const users = usuarios || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // State para modal de crear
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para otros modales y usuario seleccionado
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Bloquear scroll cuando algún modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen || isDetailsOpen || isEditOpen || isDeleteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isModalOpen, isDetailsOpen, isEditOpen, isDeleteOpen]);

  // Listeners globales
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

  // --- Filtro y paginación ---
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

  // --- Lógica CRUD ---
  const handleRegisterUser = (formData) => {
    const newUser = {
      id: Date.now(),
      Nombre: `${formData.nombre} ${formData.apellido}`,
      Correo: formData.correo,
      Documento: formData.documento,
      Telefono: formData.telefono,
      Rol: formData.rol,              // ⬅️ Campo Rol restaurado
      Estado: formData.estado ? "Activo" : "Inactivo", // ⬅️ Campo Estado restaurado
    };
    setUsuarios((prev) => [newUser, ...(prev || [])]);
    showSuccessAlert("Usuario registrado correctamente");
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDelete = (userToDelete) => {
    setUsuarios((prev) => (prev || []).filter((user) => user.id !== userToDelete.id));
    showSuccessAlert("Usuario eliminado correctamente");
  };

  const handleSaveUser = (updated) => {
    setUsuarios((prev) =>
      (prev || []).map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
    );
    showSuccessAlert("Usuario actualizado correctamente");
  };

  // --- Lógica de exportación ---
  const handleExportExcel = () => {
    exportToExcel(filtered, "usuarios", "Usuarios");
  };

  const handleExportPdf = () => {
    // Define las cabeceras que quieres en el PDF
    const headers = [
      "Nombre",
      "Correo",
      "Documento", 
      "Teléfono", 
      "Rol asignado", // ⬅️ Campo Rol restaurado para PDF
      "Estado",       // ⬅️ Campo Estado restaurado para PDF
    ];
    // Mapea los datos filtrados para que coincidan con las cabeceras
    const dataToExport = filtered.map((user) => ({
      Nombre: user.Nombre,
      Correo: user.Correo,
      Documento: user.Documento, 
      Telefono: user.Telefono,   
      Rol: user.Rol,             // ⬅️ Campo Rol restaurado
      Estado: user.Estado,       // ⬅️ Campo Estado restaurado
    }));
    exportToPdf(dataToExport, headers, "Listado de Usuarios", "usuarios");
  };

  // Variantes de animación
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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

      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
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

          {/* Buscador + botones */}
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
              <ExportExcelButton event={handleExportExcel}>Excel</ExportExcelButton>
              <ExportPDFButton event={handleExportPdf}>PDF</ExportPDFButton>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Tabla */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            key={currentPage}
          >
            <div className="table-scroll">
              <table className="min-w-full">
                <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Documento</th> 
                  <th className="px-6 py-4">Teléfono</th>  
                  <th className="px-6 py-4">Rol asignado</th> {/* ⬅️ Restaurado */}
                  <th className="px-6 py-4">Estado</th>      {/* ⬅️ Restaurado */}
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
                <motion.tbody
                  className="divide-y divide-gray-100"
                  variants={tableVariants}
                >
                {/* Ahora el colSpan es 7 (6 columnas de datos + 1 de acciones) */}
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4"> 
                      <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-600">Cargando usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((user) => (
                    <motion.tr
                      key={user.id}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">
                        {user.Nombre}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-green-700">
                        {user.Correo}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {user.Documento} 
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {user.Telefono}
                      </td>
                      {/* ⬅️ Celdas de Rol y Estado restauradas */}
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {user.Rol} 
                      </td>
                      <td className="px-6 py-4 align-top">
                        {user.Estado === "Activo" ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                            Inactivo
                          </span>
                        )}
                      </td>
                      {/* ⬅️ Fin de celdas restauradas */}
                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton
                            event={() =>
                              window.dispatchEvent(
                                new CustomEvent("open-user-details", {
                                  detail: user,
                                })
                              )
                            }
                          />

                          <EditButton
                            event={() =>
                              window.dispatchEvent(
                                new CustomEvent("open-user-edit", {
                                  detail: user,
                                })
                              )
                            }
                          />

                          <DeleteButton
                            event={() => openDeleteModal(user)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
                </motion.tbody>
              </table>
            </div>
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

      {/* --- MODALES --- */}
      <RegisterUsers
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegisterUser}
      />

      <DetailsUsers
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
      />

      <EditUsers
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <DeleteUserModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        user={userToDelete}
      />
    </>
  );
}