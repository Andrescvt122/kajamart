import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { showConfirmAlert, showSuccessAlert } from "../../shared/components/alerts.jsx";
import { useCreateRole } from "../../shared/components/hooks/roles/useCreateRole.js";

export default function RegisterRoles({ isOpen, onClose, permisosAgrupados, onRoleCreated }) {
  const { createRole, loading } = useCreateRole();

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

  // 🧩 Normalización + inicialización de permisos
  useEffect(() => {
    if (permisosAgrupados && Object.keys(permisosAgrupados).length > 0) {
      console.log("🧩 permisosAgrupados recibidos del backend:", permisosAgrupados);

      const inicial = {};
      Object.entries(permisosAgrupados).forEach(([modulo, permisos]) => {
        // Normalizamos: si vienen strings ("Crear", "Leer"), los convertimos a objetos con ID temporal
        const permisosNormalizados = permisos.map((p, index) => {
          if (typeof p === "string") {
            console.warn(`⚠️ El permiso en "${modulo}" vino como string:`, p);
            return { permiso_id: index + 1, permiso_nombre: p };
          }
          // Si ya viene como objeto, lo usamos directamente
          return {
            permiso_id: p.permiso_id ?? p.id ?? index + 1,
            permiso_nombre: p.permiso_nombre ?? p.nombre ?? "Permiso sin nombre",
          };
        });

        permisosNormalizados.forEach((p) => {
          const key = `${modulo}-${p.permiso_id}`;
          inicial[key] = false;
        });
      });

      console.log("🧱 permisos inicializados en el form (normalizados):", inicial);
      setForm((prev) => ({ ...prev, permisos: inicial }));
    }
  }, [permisosAgrupados]);

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
    const permisosModulo = permisosAgrupados[modulo] || [];
    const permisoActual = permisosModulo.find((p) => (p.permiso_id ?? p.id ?? permisosModulo.indexOf(p) + 1) === permisoIdNum);
    const nombrePermiso = permisoActual?.permiso_nombre?.toLowerCase() || "";

    // Encontrar la clave del permiso "ver" en este módulo
    const verKey = Object.keys(form.permisos).find((k) => {
      const [mod, pid] = k.split("-");
      if (mod !== modulo) return false;
      const p = permisosModulo.find((perm) => (perm.permiso_id ?? perm.id ?? permisosModulo.indexOf(perm) + 1) === parseInt(pid, 10));
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
      if (!isSelecting && nombrePermiso.includes("ver") || nombrePermiso.includes("leer")) {
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

  const toggleSelectModule = (modulo, permisos) => {
    const allSelected = permisos.every((p, i) => form.permisos[`${modulo}-${p.permiso_id ?? i + 1}`]);
    const newPermisos = {};
    permisos.forEach((p, i) => {
      const key = `${modulo}-${p.permiso_id ?? i + 1}`;
      newPermisos[key] = !allSelected;
    });
    setForm((prev) => ({ ...prev, permisos: { ...prev.permisos, ...newPermisos } }));
  };

  const handleEstadoChange = () => {
    const nuevoEstado = !form.estado;
    const message = `¿Estás seguro de que quieres cambiar el estado a ${nuevoEstado ? "'Activo'" : "'Inactivo'"}?`;
    showConfirmAlert(message).then((confirmed) => {
      if (confirmed) setForm((prev) => ({ ...prev, estado: nuevoEstado }));
    });
  };

  // 🟢 Enviar formulario
  const handleSubmit = async (e) => {
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
      .map(([key]) => parseInt(key.split("-")[1], 10))
      .filter((id) => !isNaN(id));

    console.log("✅ Permisos seleccionados:", permisosSeleccionados);

    const nuevoRol = {
      rol_nombre: form.nombreRol,
      descripcion: form.descripcion,
      estado_rol: form.estado,
      permisosIds: permisosSeleccionados,
    };

    console.log("🚀 Payload final enviado al backend:", nuevoRol);

    const creado = await createRole(nuevoRol);
    if (creado) {
      showSuccessAlert("Rol creado correctamente ✅");
      // 💡 FIX: La respuesta de la API (`creado`) puede no tener la estructura completa
      // que la tabla necesita. Construimos el objeto con los datos del formulario.
      const rolParaUI = {
        rol_id: creado.rol_id, // Usamos el ID devuelto por el backend
        rol_nombre: form.nombreRol,
        descripcion: form.descripcion,
        estado_rol: form.estado,
        // 💡 FIX: Añadir la propiedad de permisos para que la estructura del objeto sea consistente
        rol_permisos: creado.rol_permisos || [],
      };
      onRoleCreated(rolParaUI); // 🚀 Notifica al padre con el objeto completo para la UI

      // 💡 FIX: Reiniciar el formulario a su estado inicial después de una creación exitosa.
      setForm({
        nombreRol: "",
        descripcion: "",
        estado: true,
        permisos: {},
      });
      setValidations({
        nombreRol: { error: null, isValid: false },
        descripcion: { error: null, isValid: false },
      });
    }
  };

  // 🟢 Animaciones Framer Motion
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.14 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.14 } },
  };

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
                <h2 className="text-xl font-bold text-gray-800">Crear Rol</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nombre y descripción */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del rol</label>
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
                        placeholder="Nombre del rol"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
                        placeholder="Descripción del rol"
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
                  <span className="text-sm font-medium text-gray-700">Estado del Rol</span>
                  <span className={`text-sm ${form.estado ? "text-green-600" : "text-red-600"}`}>
                    {form.estado ? "Activo" : "Inactivo"}
                  </span>
                  <label className="inline-flex relative items-center cursor-pointer ml-auto">
                    <input type="checkbox" checked={form.estado} onChange={handleEstadoChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>

                {/* Permisos */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Asignar permisos y privilegios</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" onChange={toggleSelectAll} checked={Object.values(form.permisos).every((v) => v)} />
                      <span className="text-green-700 text-sm">Seleccionar todos</span>
                    </label>
                  </div>

                  <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Módulo</th>
                          <th className="px-4 py-3 text-left">Permisos/Privilegios</th>
                          <th className="px-4 py-3 text-center">Todos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(permisosAgrupados).map(([modulo, permisos], i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-medium text-gray-900">{modulo}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-4">
                                {permisos.map((p, index) => {
                                  const permiso = typeof p === "string" ? { permiso_id: index + 1, permiso_nombre: p } : p;
                                  const key = `${modulo}-${permiso.permiso_id}`;
                                  return (
                                    <label key={key} className="inline-flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={form.permisos[key] || false}
                                        onChange={() => handlePermisoChange(key)}
                                      />
                                      <span className="text-green-600 font-medium">{permiso.permiso_nombre}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                onChange={() => toggleSelectModule(modulo, permisos)}
                                checked={permisos.every(
                                  (p, index) => form.permisos[`${modulo}-${p.permiso_id ?? index + 1}`]
                                )}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !validations.nombreRol.isValid || !validations.descripcion.isValid}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creando..." : "Crear rol"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}