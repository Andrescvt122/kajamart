import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import { Search, ChevronDown } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import { motion, AnimatePresence } from "framer-motion";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts.jsx"; // Asegúrate de tener estas alertas

// Importar modales
import DetailsUsers from "./detailsUsers";
import EditUsers from "./editUsers";

// Componente para el switch de estado
const EstadoToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
      enabled ? "bg-green-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);


export default function IndexUsers() {
  // ahora con setter para poder actualizar usuario si es necesario
  const [users, setUsers] = useState([
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
  
  // State para el modal de crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    usuario: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    nombre: "",
    apellido: "",
    telefono: "",
    documento: "",
    rol: "",
    estado: true, // true para 'Activo', false para 'Inactivo'
  });

  // Estados para modales abiertos por eventos y usuario seleccionado
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Refs para dropdowns
  const rolRef = useRef(null);
  const [rolOpen, setRolOpen] = useState(false);
  
  const rolesOptions = ["Administrador", "Vendedor", "Cliente"];

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isModalOpen]);

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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleOutside(e) {
      if (rolRef.current && !rolRef.current.contains(e.target)) setRolOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);
  
  // Lógica de filtrado y paginación
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
  const listVariants = { hidden: { opacity: 0, y: -6, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { staggerChildren: 0.02 } } };
  const itemVariants = { hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } };
  
  // --- Lógica del formulario del modal ---  

  const sanitizeNumeric = (value) => value.replace(/\D/g, "");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono" || name === "documento") {
      const numeric = sanitizeNumeric(value);
      setForm((prev) => ({ ...prev, [name]: numeric }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleNumericKeyDown = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = [];
    if (!form.usuario.trim()) missing.push("Usuario");
    if (!form.correo.trim()) missing.push("Correo");
    if (form.correo && !isValidEmail(form.correo)) missing.push("Correo (inválido)");
    if (!form.contrasena) missing.push("Contraseña");
    if (form.contrasena.length < 8) missing.push("Contraseña (muy corta)");
    if (form.contrasena !== form.confirmarContrasena) missing.push("Las contraseñas no coinciden");
    if (!form.nombre.trim()) missing.push("Nombre");
    if (!form.apellido.trim()) missing.push("Apellido");
    if (!form.documento.trim()) missing.push("Documento");
    if (!form.rol) missing.push("Rol asignado");

    if (missing.length > 0) {
      showErrorAlert(`Campos inválidos: ${missing.join(", ")}`);
      return;
    }

    console.log("Usuario registrado:", form);
    
    // Resetear y cerrar
    setForm({
      usuario: "", correo: "", contrasena: "", confirmarContrasena: "",
      nombre: "", apellido: "", telefono: "", documento: "",
      rol: "", estado: true,
    });
    setRolOpen(false);
    setIsModalOpen(false);
    showSuccessAlert("Usuario registrado exitosamente");
  };

  // handler para guardar cambios desde EditUsers
  const handleSaveUser = (updated) => {
    setUsers(prev => prev.map(u => (u.Correo === updated.correo || u.Correo === updated.Correo) ? { ...u, ...updated } : u));
  };

  return (
    <>
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

          {/* Barra de búsqueda y botones */}
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

          {/* Tabla */}
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
                          {/* Emitir eventos en vez de onclick directo */}
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
      
       {/* --- MODAL REGISTRAR USUARIO --- */}
       <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative pointer-events-auto max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-1 text-gray-800">Registrar usuarios</h2>
                <p className="text-sm text-gray-500 mb-6">Completa los campos para crear un nuevo usuario.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Usuario */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Usuario *</label>
                      <input name="usuario" value={form.usuario} onChange={handleFormChange} placeholder="e.g. alex.rodriguez" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                    {/* Correo */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Correo *</label>
                      <input name="correo" type="email" value={form.correo} onChange={handleFormChange} placeholder="example@domain.com" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Contraseña *</label>
                      <input name="contrasena" type="password" value={form.contrasena} onChange={handleFormChange} placeholder="Ingresar contraseña" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Confirmar contraseña *</label>
                      <input name="confirmarContrasena" type="password" value={form.confirmarContrasena} onChange={handleFormChange} placeholder="Confirmar contraseña" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                     {/* Nombre */}
                     <div>
                      <label className="block text-sm text-gray-700 mb-1">Nombre *</label>
                      <input name="nombre" value={form.nombre} onChange={handleFormChange} placeholder="e.g. Alex" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                     {/* Apellido */}
                     <div>
                      <label className="block text-sm text-gray-700 mb-1">Apellido *</label>
                      <input name="apellido" value={form.apellido} onChange={handleFormChange} placeholder="e.g. Rodriguez" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                     {/* Teléfono */}
                     <div>
                      <label className="block text-sm text-gray-700 mb-1">Teléfono (opcional)</label>
                      <input name="telefono" value={form.telefono} onChange={handleFormChange} onKeyDown={handleNumericKeyDown} inputMode="numeric" placeholder="e.g. +57 3XX XXX XXXX" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" />
                    </div>

                    {/* Documento */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Documento *</label>
                      <input name="documento" value={form.documento} onChange={handleFormChange} onKeyDown={handleNumericKeyDown} inputMode="numeric" placeholder="e.g. 102849458" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                    </div>

                    {/* Rol Asignado Dropdown */}
                    <div ref={rolRef}>
                      <label className="block text-sm text-gray-700 mb-1">Rol asignado *</label>
                      <div className="relative">
                        <button type="button" onClick={() => setRolOpen(s => !s)} className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-green-200" aria-haspopup="listbox" aria-expanded={rolOpen}>
                          <span className={`text-sm ${form.rol ? "text-gray-800" : "text-gray-400"}`}>{form.rol || "Selecciona un rol"}</span>
                          <motion.span animate={{ rotate: rolOpen ? 180 : 0 }}><ChevronDown size={18} /></motion.span>
                        </button>
                        <AnimatePresence>
                          {rolOpen && (
                            <motion.ul className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50" initial="hidden" animate="visible" exit="hidden" variants={listVariants}>
                              {rolesOptions.map((opt) => (
                                <motion.li key={opt} variants={itemVariants} onClick={() => { setForm(p => ({ ...p, rol: opt })); setRolOpen(false); }} className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50">
                                  {opt}
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    {/* Estado del usuario */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Estado del usuario</label>
                        <div className="flex items-center gap-3 mt-2">
                           <EstadoToggle enabled={form.estado} onChange={() => setForm(p => ({...p, estado: !p.estado}))} />
                           <span className="text-sm text-gray-600">{form.estado ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="submit" className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition">Guardar Usuario</button>
                  </div>
                </form>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* MODALES abiertos por eventos */}
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