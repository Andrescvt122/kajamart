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
  showConfirmAlert,
} from "../../shared/components/alerts.jsx";

// Importar modales
import DetailsUsers from "./detailsUsers";
import EditUsers from "./editUsers";
import RegisterUsers from "./registerUsers"; // <-- IMPORTAR EL NUEVO MODAL

export default function IndexUsers() {
  const [users, setUsers] = useState([
    // ... (datos de usuarios iniciales sin cambios)
     {
      Nombre: "Sophia Clark",
      Correo: "sophia.clark@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-01-15",
    },
    {
      Nombre: "Ethan Martinez",
      Correo: "ethan.martinez@example.com",
      Rol: "Vendedor",
      Estado: "Activo",
      FechaCreacion: "2023-02-20",
    },
    {
      Nombre: "Olivia Rodriguez",
      Correo: "olivia.rodriguez@example.com",
      Rol: "Cliente",
      Estado: "Inactivo",
      FechaCreacion: "2023-03-10",
    },
    {
      Nombre: "Liam Wilson",
      Correo: "liam.wilson@example.com",
      Rol: "Vendedor",
      Estado: "Activo",
      FechaCreacion: "2023-04-05",
    },
    {
      Nombre: "Ava Garcia",
      Correo: "ava.garcia@example.com",
      Rol: "Administrador",
      Estado: "Activo",
      FechaCreacion: "2023-05-12",
    },
    {
      Nombre: "Noah Lopez",
      Correo: "noah.lopez@example.com",
      Rol: "Cliente",
      Estado: "Inactivo",
      FechaCreacion: "2023-06-18",
    },
    {
      Nombre: "Isabella Lee",
      Correo: "isabella.lee@example.com",
      Rol: "Vendedor",
      Estado: "Activo",
      FechaCreacion: "2023-07-22",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;
  
  // State para el modal de crear (solo para controlar si está abierto o cerrado)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para otros modales y usuario seleccionado
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Bloquear scroll del body cuando CUALQUIER modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen || isDetailsOpen || isEditOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isModalOpen, isDetailsOpen, isEditOpen]);

  // Escuchar eventos globales para abrir modales (detalles / editar)
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

  // Lógica de filtrado y paginación (sin cambios)
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

  // Variantes de animación
  const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const rowVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  // --- LÓGICA DE MANEJO DE DATOS ---

  // NUEVO: Handler para registrar un usuario desde el modal
  const handleRegisterUser = (formData) => {
    const newUser = {
      Nombre: `${formData.nombre} ${formData.apellido}`,
      Correo: formData.correo,
      Rol: formData.rol,
      Estado: formData.estado ? "Activo" : "Inactivo",
      FechaCreacion: new Date().toISOString().split('T')[0], // Fecha de hoy
    };
    setUsers(prevUsers => [newUser, ...prevUsers]);
  };

  const handleDelete = async (userToDelete) => {
    const confirmed = await showConfirmAlert(
      `¿Estás seguro de que deseas eliminar al usuario ${userToDelete.Nombre}?`
    );
    if (confirmed) {
      setUsers((prev) =>
        prev.filter((user) => user.Correo !== userToDelete.Correo)
      );
      showSuccessAlert("Usuario eliminado correctamente");
    }
  };

  const handleSaveUser = (updated) => {
    setUsers(prev => prev.map(u => (u.Correo === updated.Correo) ? { ...u, ...updated } : u));
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Gestión de Usuarios</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de tienda
              </p>
            </div>
          </div>
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
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Usuario
              </button>
            </div>
          </div>

          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            key={currentPage}
          >
            <table className="min-w-full">
               {/* ... (contenido de la tabla sin cambios) ... */}
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
              <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((user, i) => (
                    <motion.tr key={`${user.Correo}-${i}`} className="hover:bg-gray-50" variants={rowVariants}>
                      <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">{user.Nombre}</td>
                      <td className="px-6 py-4 align-top text-sm text-green-700">{user.Correo}</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">{user.Rol}</td>
                      <td className="px-6 py-4 align-top">
                        {user.Estado === "Activo" ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">Activo</span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">Inactivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">{user.FechaCreacion}</td>
                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent("open-user-details", { detail: user }))}
                            className="rounded"
                          >
                            <ViewButton />
                          </button>

                          <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent("open-user-edit", { detail: user }))}
                            className="rounded"
                          >
                            <EditButton />
                          </button>

                          <DeleteButton alert={() => handleDelete(user)} />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </motion.div>

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
    </>
  );
}