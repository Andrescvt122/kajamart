import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts.jsx";
import { useRolesList } from "../../shared/components/hooks/roles/useRolesList.js";
import { useCreateUsuario } from "../../shared/components/hooks/users/useCreateUser.js";
import { useUsuariosList } from "../../shared/components/hooks/users/useUserList";
import { useAuth } from "../../context/useAtuh.jsx";

// 🔘 Switch de estado (Activo/Inactivo)
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

export default function RegisterUsers({ isOpen, onClose }) {
  const { roles } = useRolesList();
  const { createUsuario } = useCreateUsuario();
  const { usuarios } = useUsuariosList();

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
    rol_id: null,
    estado: true,
  });

  const [errors, setErrors] = useState({});

  const [rolOpen, setRolOpen] = useState(false);
  const rolRef = useRef(null);

  // 🧹 Resetear formulario al cerrar modal
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
        rol_id: null,
        estado: true,
      });
      setErrors({});
      setRolOpen(false);
    }
  }, [isOpen]);

  // 🔒 Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleOutside = (e) => {
      if (rolRef.current && !rolRef.current.contains(e.target)) {
        setRolOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // 🔢 Solo números en documento y teléfono
  const sanitizeNumeric = (value) => value.replace(/\D/g, "");
  const handleNumericKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  // 🧩 Manejo de cambios
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono" || name === "documento") {
      setForm((prev) => ({ ...prev, [name]: sanitizeNumeric(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Validaciones en tiempo real
    if (name === "correo") {
      const emailError = !isValidEmail(value) ? "Formato de correo inválido." : validateEmailUniqueness(value);
      setErrors((prev) => ({ ...prev, correo: emailError }));
    }
    if (name === "documento") {
      const docError = validateDocumentoUniqueness(value);
      setErrors((prev) => ({ ...prev, documento: docError }));
    }
    if (name === "contrasena") {
      const passError = validatePassword(value);
      setErrors((prev) => ({ ...prev, contrasena: passError }));
      // Revalidar confirmar contraseña
      if (form.confirmarContrasena) {
        const confirmError = validateConfirmPassword(form.confirmarContrasena, value);
        setErrors((prev) => ({ ...prev, confirmarContrasena: confirmError }));
      }
    }
    if (name === "confirmarContrasena") {
      const confirmError = validateConfirmPassword(value, form.contrasena);
      setErrors((prev) => ({ ...prev, confirmarContrasena: confirmError }));
    }
  };

  // 📧 Validar formato email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔐 Validar contraseña
  const validatePassword = (password) => {
    if (!password) return "La contraseña es requerida.";
    if (password.length < 8) return "Debe tener al menos 8 caracteres.";
    if (!/[a-z]/.test(password)) return "Debe contener al menos una letra minúscula.";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una letra mayúscula.";
    if (!/\d/.test(password)) return "Debe contener al menos un número.";
    return "";
  };

  // 🔐 Validar confirmar contraseña
  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Confirmar contraseña es requerido.";
    if (confirmPassword !== password) return "Las contraseñas no coinciden.";
    return "";
  };

  // 📧 Validar unicidad de correo
  const validateEmailUniqueness = (email) => {
    if (!email) return "";
    const exists = usuarios?.some(user => user.Correo?.toLowerCase() === email.toLowerCase());
    return exists ? "Este correo ya está registrado." : "";
  };

  // 🆔 Validar unicidad de documento
  const validateDocumentoUniqueness = (documento) => {
    if (!documento) return "";
    const exists = usuarios?.some(user => user.Documento === documento);
    return exists ? "Este documento ya está registrado." : "";
  };

  // 🧾 Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar errores de validación
    const hasErrors = Object.values(errors).some((err) => err);
    if (hasErrors) {
      showErrorAlert("Corrige los errores antes de enviar.");
      return;
    }

    const missing = [];

    if (!form.nombre.trim()) missing.push("Nombre");
    if (!form.apellido.trim()) missing.push("Apellido");
    if (!form.correo.trim()) missing.push("Correo");
    if (!form.documento.trim()) missing.push("Documento");
    if (!form.rol_id) missing.push("Rol asignado");
    if (!form.contrasena.trim()) missing.push("Contraseña");
    if (!form.confirmarContrasena.trim()) missing.push("Confirmar contraseña");

    if (missing.length > 0) {
      showErrorAlert(`Campos requeridos: ${missing.join(", ")}`);
      return;
    }

    const result = await createUsuario(form);

    if (result) {
      showSuccessAlert("Usuario registrado exitosamente");
      onClose();
    } else {
      showErrorAlert("Error al crear el usuario");
    }
  };

  // 🎨 Animaciones del dropdown
  const listVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { staggerChildren: 0.02 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
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
              <h2 className="text-2xl font-bold mb-1 text-gray-800">
                Registrar usuarios
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Completa los campos para crear un nuevo usuario.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Documento *
                    </label>
                    <input
                      name="documento"
                      value={form.documento}
                      onChange={handleFormChange}
                      onKeyDown={handleNumericKeyDown}
                      inputMode="numeric"
                      placeholder="e.g. 102849458"
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                      required
                    />
                    {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Correo *
                    </label>
                    <input
                      name="correo"
                      type="email"
                      value={form.correo}
                      onChange={handleFormChange}
                      placeholder="example@domain.com"
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                      required
                    />
                    {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Contraseña *
                    </label>
                    <input
                      name="contrasena"
                      type="password"
                      value={form.contrasena}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                      required
                      minLength={8}
                      pattern="^(?=.*[A-Za-z])(?=.*\d).{8,}$"
                      title="Debe tener mínimo 8 caracteres e incluir al menos 1 letra y 1 número."
                    />
                    {errors.contrasena && <p className="text-red-500 text-sm mt-1">{errors.contrasena}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Confirmar contraseña *
                    </label>
                    <input
                      name="confirmarContrasena"
                      type="password"
                      value={form.confirmarContrasena}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                      required
                      minLength={8}
                      pattern="^(?=.*[A-Za-z])(?=.*\d).{8,}$"
                      title="Debe tener mínimo 8 caracteres e incluir al menos 1 letra y 1 número."
                    />
                    {errors.confirmarContrasena && <p className="text-red-500 text-sm mt-1">{errors.confirmarContrasena}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleFormChange}
                      onKeyDown={handleNumericKeyDown}
                      inputMode="numeric"
                      placeholder="e.g. +57 3XX XXX XXXX"
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>
                  {/* 🔽 Dropdown de roles */}
                  <div ref={rolRef}>
                    <label className="block text-sm text-gray-700 mb-1">
                      Rol asignado *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setRolOpen((s) => !s)}
                        className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                      >
                        <span
                          className={`text-sm ${
                            form.rol ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {form.rol || "Selecciona un rol"}
                        </span>
                        <motion.span animate={{ rotate: rolOpen ? 180 : 0 }}>
                          <ChevronDown size={18} />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {rolOpen && (
                          <motion.ul
                            className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={listVariants}
                          >
                            {roles.map((opt) => (
                              <motion.li
                                key={opt.rol_id}
                                variants={itemVariants}
                                onClick={() => {
                                  setForm((p) => ({
                                    ...p,
                                    rol: opt.rol_nombre,
                                    rol_id: opt.rol_id,
                                  }));
                                  setRolOpen(false);
                                }}
                                className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50"
                              >
                                {opt.rol_nombre}
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {/* 🔘 Estado del usuario */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Estado del usuario
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                      <EstadoToggle
                        enabled={form.estado}
                        onChange={() =>
                          setForm((p) => ({ ...p, estado: !p.estado }))
                        }
                      />
                      <span className="text-sm text-gray-600">
                        {form.estado ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Guardar Usuario
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
