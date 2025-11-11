import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { showErrorAlert, showSuccessAlert } from "../../shared/components/alerts.jsx";
import {useRolesList} from "../../shared/components/hooks/roles/useRolesList.js";
import {useCreateUsuario} from "../../shared/components/hooks/users/useCreateUser.js";
// Componente para el switch de estado (movido aquí porque solo lo usa este modal)
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

export default function RegisterUsers({ isOpen, onClose, onRegister }) {
  const { roles } = useRolesList();
  const { createUsuario } = useCreateUsuario();
  console.log(roles);
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

  const [rolOpen, setRolOpen] = useState(false);
  const rolRef = useRef(null);
  const rolesOptions = roles;

  // Resetear el formulario cuando el modal se cierra para que esté limpio la próxima vez que se abra
  useEffect(() => {
    if (!isOpen) {
      setForm({
        usuario: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        nombre: "",
        apellido: "",
        telefono: "",
        documento: "",
        rol: "",
        estado: true,
      });
      setRolOpen(false);
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleOutside(e) {
      if (rolRef.current && !rolRef.current.contains(e.target)) {
        setRolOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Variantes de animación para el dropdown
  const listVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { staggerChildren: 0.02 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } };

  // --- Lógica del formulario ---
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
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
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
    createUsuario(form);
    showSuccessAlert("Usuario registrado exitosamente");
    onClose(); // Cierra el modal
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  {/* ... (todos los inputs del formulario permanecen igual) ... */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Usuario *</label>
                    <input name="usuario" value={form.usuario} onChange={handleFormChange} placeholder="e.g. alex.rodriguez" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Correo *</label>
                    <input name="correo" type="email" value={form.correo} onChange={handleFormChange} placeholder="example@domain.com" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Contraseña *</label>
                    <input name="contrasena" type="password" value={form.contrasena} onChange={handleFormChange} placeholder="Ingresar contraseña" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Confirmar contraseña *</label>
                    <input name="confirmarContrasena" type="password" value={form.confirmarContrasena} onChange={handleFormChange} placeholder="Confirmar contraseña" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre *</label>
                    <input name="nombre" value={form.nombre} onChange={handleFormChange} placeholder="e.g. Alex" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Apellido *</label>
                    <input name="apellido" value={form.apellido} onChange={handleFormChange} placeholder="e.g. Rodriguez" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Teléfono (opcional)</label>
                    <input name="telefono" value={form.telefono} onChange={handleFormChange} onKeyDown={handleNumericKeyDown} inputMode="numeric" placeholder="e.g. +57 3XX XXX XXXX" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Documento *</label>
                    <input name="documento" value={form.documento} onChange={handleFormChange} onKeyDown={handleNumericKeyDown} inputMode="numeric" placeholder="e.g. 102849458" className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none" required />
                  </div>
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
                              <motion.li key={opt.rol_id} variants={itemVariants} onClick={() => { setForm(p => ({ ...p, rol: opt.rol_nombre })); setRolOpen(false); }} className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50">
                                {opt.rol_nombre}
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Estado del usuario</label>
                    <div className="flex items-center gap-3 mt-2">
                      <EstadoToggle enabled={form.estado} onChange={() => setForm(p => ({ ...p, estado: !p.estado }))} />
                      <span className="text-sm text-gray-600">{form.estado ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancelar</button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition">Guardar Usuario</button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}