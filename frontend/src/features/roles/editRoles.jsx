// Archivo: editRoles.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { showSuccessAlert, showConfirmAlert } from "../../shared/components/alerts.jsx";
import { usePermisosList } from "../../shared/components/hooks/roles/usePermisosList.js";
import { useUpdateRole } from "../../shared/components/hooks/roles/useUpdateRole.js";
import axios from "axios";

export default function EditRoles({ isOpen, onClose, role, onRoleUpdated }) {
  const { permisosAgrupados: permisosDisponibles, loading: loadingPermisos } = usePermisosList();
  const { updateRole, loading: isUpdating } = useUpdateRole();

  const [rolCompleto, setRolCompleto] = useState(null);
  const [form, setForm] = useState({
    nombreRol: "",
    descripcion: "",
    estado: true,
    permisos: {},
  });

  // 🔍 Estado para validaciones en tiempo real
  const [validations, setValidations] = useState({
    nombreRol: { error: null, isValid: false },
    descripcion: { error: null, isValid: false },
  });

  // 🔍 Funciones de validación
  const validateNombreRol = (value) => {
    if (!value || value.trim().length === 0) {
      return { error: "El nombre del rol es requerido", isValid: false };
    }
    if (value.trim().length < 3) {
      return { error: "El nombre debe tener al menos 3 caracteres", isValid: false };
    }
    if (value.trim().length > 50) {
      return { error: "El nombre no debe exceder 50 caracteres", isValid: false };
    }
    if (!/^[a-zA-Z\s_-]+$/.test(value)) {
      return { error: "Solo se permiten letras, espacios, guiones y guiones bajos", isValid: false };
    }
    return { error: null, isValid: true };
  };

  const validateDescripcion = (value) => {
    if (!value || value.trim().length === 0) {
      return { error: "La descripción es requerida", isValid: false };
    }
    if (value.trim().length < 10) {
      return { error: "La descripción debe tener al menos 10 caracteres", isValid: false };
    }
    if (value.trim().length > 500) {
      return { error: "La descripción no debe exceder 500 caracteres", isValid: false };
    }
    return { error: null, isValid: true };
  };

  // 🟢 Cargar detalles completos del rol (incluyendo permisos)
  useEffect(() => {
    if (role?.rol_id) {
      // Inicializa el formulario con los datos básicos del rol
      setForm({
        nombreRol: role.rol_nombre,
        descripcion: role.descripcion,
        estado: role.estado_rol,
        permisos: {},
      });
      // Validar los datos iniciales
      setValidations({
        nombreRol: validateNombreRol(role.rol_nombre),
        descripcion: validateDescripcion(role.descripcion),
      });
      setRolCompleto(null);

      const getRolDetails = async () => {
        try {
          const { data } = await axios.get(
            `http://localhost:3000/kajamart/api/roles/${role.rol_id}`
          );
          setRolCompleto(data); // Carga los permisos del rol
        } catch (error) {
          console.error("❌ Error al cargar los detalles del rol:", error);
        }
      };

      getRolDetails();
    } else {
      setForm({ nombreRol: "", descripcion: "", estado: true, permisos: {} });
      setValidations({
        nombreRol: { error: null, isValid: false },
        descripcion: { error: null, isValid: false },
      });
      setRolCompleto(null);
    }
  }, [role]);

  // 🧩 Inicializar permisos cuando llegan el rol y los permisos disponibles
  useEffect(() => {
    if (
      rolCompleto &&
      permisosDisponibles &&
      Object.keys(permisosDisponibles).length > 0
    ) {
      const inicial = {};
      Object.entries(permisosDisponibles).forEach(([modulo, permisos]) => {
        const permisosDelRol = new Set(
          (rolCompleto.rol_permisos || []).map(
            (p) => p.permisos?.permiso_id || p.permiso_id
          )
        );
        permisos.forEach((p) => {
          const key = `${modulo}-${p.permiso_id}`;
          inicial[key] = permisosDelRol.has(p.permiso_id);
        });
      });

      setForm((prevForm) => ({
        ...prevForm,
        permisos: inicial,
      }));
    }
  }, [rolCompleto, permisosDisponibles]);

  // 🧩 Manejadores de cambios con validación en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 🔍 Ejecutar validación según el campo
    if (name === "nombreRol") {
      const validation = validateNombreRol(value);
      setValidations((prev) => ({ ...prev, nombreRol: validation }));
    } else if (name === "descripcion") {
      const validation = validateDescripcion(value);
      setValidations((prev) => ({ ...prev, descripcion: validation }));
    }
  };

  const handlePermisoChange = (key) => {
    const [modulo, permisoId] = key.split("-");
    const permisoIdNum = parseInt(permisoId, 10);

    // Encontrar el permiso actual
    const permisosModulo = permisosDisponibles[modulo] || [];
    const permisoActual = permisosModulo.find((p) => p.permiso_id === permisoIdNum);
    const nombrePermiso = permisoActual?.permiso_nombre?.toLowerCase() || "";

    // Encontrar la clave del permiso "ver" en este módulo
    const verKey = Object.keys(form.permisos).find((k) => {
      const [mod, pid] = k.split("-");
      if (mod !== modulo) return false;
      const p = permisosModulo.find((perm) => perm.permiso_id === parseInt(pid, 10));
      return p?.permiso_nombre?.toLowerCase().includes("ver") || p?.permiso_nombre?.toLowerCase().includes("leer");
    });

    setForm((prev) => {
      const newPermisos = { ...prev.permisos };
      const isSelecting = !newPermisos[key];

      // Cambiar el permiso actual
      newPermisos[key] = isSelecting;

      // Si se selecciona un permiso que no es "ver", seleccionar "ver" automáticamente
      if (isSelecting && !nombrePermiso.includes("ver") && !nombrePermiso.includes("leer") && verKey) {
        newPermisos[verKey] = true;
      }

      // Si se deselecciona "ver", deseleccionar todos los demás permisos del módulo
      if (!isSelecting && (nombrePermiso.includes("ver") || nombrePermiso.includes("leer"))) {
        Object.keys(newPermisos).forEach((k) => {
          const [mod] = k.split("-");
          if (mod === modulo && k !== key) {
            newPermisos[k] = false;
          }
        });
      }

      return { ...prev, permisos: newPermisos };
    });
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(form.permisos).every((v) => v);
    const newPermisos = {};
    Object.keys(form.permisos).forEach((key) => {
      newPermisos[key] = !allSelected;
    });
    setForm((prev) => ({ ...prev, permisos: newPermisos }));
  };

  const handleEstadoChange = () => {
    const nuevoEstado = !form.estado;
    const message = `¿Estás seguro de cambiar el estado a ${
      nuevoEstado ? "'Activo'" : "'Inactivo'"
    }?`;

    showConfirmAlert(message).then((confirmed) => {
      if (confirmed) setForm((prev) => ({ ...prev, estado: nuevoEstado }));
    });
  };

  // 🟢 Guardar cambios
  const handleUpdate = async (e) => {
    e.preventDefault();

    // 🔍 Validar antes de enviar
    const validacionNombre = validateNombreRol(form.nombreRol);
    const validacionDescripcion = validateDescripcion(form.descripcion);

    setValidations({
      nombreRol: validacionNombre,
      descripcion: validacionDescripcion,
    });

    if (!validacionNombre.isValid || !validacionDescripcion.isValid) {
      return;
    }

    const permisosSeleccionados = Object.entries(form.permisos)
      .filter(([_, checked]) => checked)
      .map(([key]) => parseInt(key.split("-")[1], 10));

    const actualizado = {
      rol_nombre: form.nombreRol,
      descripcion: form.descripcion,
      estado_rol: form.estado,
      permisosIds: permisosSeleccionados,
    };

    try {
      const updatedRole = await updateRole(role.rol_id, actualizado);

      if (updatedRole) {
        showSuccessAlert("Rol actualizado correctamente ✅");

        // 👇 Construimos el objeto actualizado para reflejarlo al instante
        const rolActualizadoParaUI = {
          rol_id: role.rol_id,
          rol_nombre: form.nombreRol,
          descripcion: form.descripcion,
          estado_rol: form.estado,
        };

        // 🚀 Notifica al componente padre (IndexRoles)
        if (onRoleUpdated) onRoleUpdated(rolActualizadoParaUI);

        // Cierra el modal
        onClose();
      }
    } catch (error) {
      console.error("❌ Error al actualizar el rol:", error);
    }
  };

  // 🧩 Animaciones
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.14 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.14 } },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal principal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Editar Rol</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Nombre y descripción */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del rol
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nombreRol"
                        value={form.nombreRol}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-black transition ${
                          form.nombreRol
                            ? validations.nombreRol.isValid
                              ? "border-green-500 focus:ring-2 focus:ring-green-500"
                              : "border-red-500 focus:ring-2 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {form.nombreRol && (
                        <div className="absolute right-3 top-3">
                          {validations.nombreRol.isValid ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {form.nombreRol && validations.nombreRol.error && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {validations.nombreRol.error}
                      </p>
                    )}
                    {form.nombreRol && validations.nombreRol.isValid && (
                      <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Nombre válido
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <div className="relative">
                      <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-black transition ${
                          form.descripcion
                            ? validations.descripcion.isValid
                              ? "border-green-500 focus:ring-2 focus:ring-green-500"
                              : "border-red-500 focus:ring-2 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        rows={3}
                      />
                      {form.descripcion && (
                        <div className="absolute right-3 top-3">
                          {validations.descripcion.isValid ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {form.descripcion && validations.descripcion.error && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {validations.descripcion.error}
                      </p>
                    )}
                    {form.descripcion && validations.descripcion.isValid && (
                      <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Descripción válida
                      </p>
                    )}
                  </div>
                </div>

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
                      onChange={handleEstadoChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>

                {/* Permisos */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Permisos asignados al rol</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" onChange={toggleSelectAll} checked={Object.values(form.permisos).every((v) => v)} />
                      <span className="text-green-700 text-sm">Seleccionar todos</span>
                    </label>
                  </div>

                  {loadingPermisos ? (
                    <p className="text-gray-500 text-sm">Cargando permisos...</p>
                  ) : (
                    <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                      <table className="min-w-full text-sm">
                        <thead className="bg-green-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left">Módulo</th>
                            <th className="px-4 py-3 text-left">Permisos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {Object.entries(permisosDisponibles).map(
                            ([modulo, permisos]) => (
                              <tr key={modulo}>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {modulo}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-4">
                                    {permisos.map((p) => {
                                      const key = `${modulo}-${p.permiso_id}`;
                                      return (
                                        <label
                                          key={key}
                                          className="inline-flex items-center gap-2"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={form.permisos[key] || false}
                                            onChange={() =>
                                              handlePermisoChange(key)
                                            }
                                          />
                                          <span className="text-green-700 font-medium">
                                            {p.permiso_nombre}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || !validations.nombreRol.isValid || !validations.descripcion.isValid}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
              {/* Overlay de carga mientras se actualiza el rol */}
              {isUpdating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-700 font-medium">Actualizando rol...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}