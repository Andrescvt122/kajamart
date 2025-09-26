// src/pages/roles/editRoles.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, HelpCircle } from "lucide-react";
import { showConfirmAlert, showSuccessAlert } from "../../shared/components/alerts.jsx";

export default function EditRoles({
  isOpen,
  onClose,
  role,
  permisosDisponibles = {},
  onUpdate,
}) {
  const [form, setForm] = useState({
    nombreRol: "",
    descripcion: "",
    estado: true,
    permisos: {},
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Variantes de animación reutilizables
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
      transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.14 } },
  };

  // ✅ Cargar datos iniciales cuando cambie el rol
  useEffect(() => {
    if (role) {
      setForm({
        nombreRol: role.NombreRol || "",
        descripcion: role.Descripción || "",
        estado: role.Estado === "Activo",
        permisos: role.Permisos
          ? role.Permisos.reduce((acc, p) => {
              const key = `${p.modulo}-${p.permiso}`;
              acc[key] = true;
              return acc;
            }, {})
          : {},
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermisoChange = (key) => {
    setForm((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [key]: !prev.permisos[key],
      },
    }));
  };

  // ✅ Seleccionar/Deseleccionar todos
  const toggleSelectAll = () => {
    const allSelected = Object.entries(permisosDisponibles).every(([modulo, permisos]) =>
      permisos.every((permiso) => form.permisos[`${modulo}-${permiso}`])
    );

    const newPermisos = {};
    Object.entries(permisosDisponibles).forEach(([modulo, permisos]) => {
      permisos.forEach((permiso) => {
        const key = `${modulo}-${permiso}`;
        newPermisos[key] = !allSelected;
      });
    });

    setForm((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, ...newPermisos },
    }));
  };

  // ✅ Seleccionar/Deseleccionar por módulo
  const toggleSelectModule = (modulo, permisos) => {
    const allSelected = permisos.every(
      (permiso) => form.permisos[`${modulo}-${permiso}`]
    );

    const newPermisos = {};
    permisos.forEach((permiso) => {
      const key = `${modulo}-${permiso}`;
      newPermisos[key] = !allSelected;
    });

    setForm((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, ...newPermisos },
    }));
  };

  const handleEstadoChange = () => {
    const nuevoEstado = !form.estado;
    const message = `¿Estás seguro de que quieres cambiar el estado a ${
      nuevoEstado ? "'Activo'" : "'Inactivo'"
    }?`;

    showConfirmAlert(message).then((confirmed) => {
      if (confirmed) setForm((prev) => ({ ...prev, estado: nuevoEstado }));
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombreRol.trim()) {
      return;
    }

    showConfirmAlert("¿Confirmas actualizar este rol?").then((confirmed) => {
      if (confirmed) confirmUpdate();
    });
  };

  const confirmUpdate = () => {
    onUpdate({
      ...role,
      NombreRol: form.nombreRol,
      Descripción: form.descripcion,
      Estado: form.estado ? "Activo" : "Inactivo",
      Permisos: Object.entries(form.permisos)
        .filter(([_, checked]) => checked)
        .map(([key]) => {
          const [modulo, permiso] = key.split("-");
          return { modulo, permiso };
        }),
    });

    showSuccessAlert("Rol actualizado correctamente").then(() => onClose());
  };

  return (
    <AnimatePresence>
      {isOpen && role && (
        <>
          {/* Overlay principal */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Contenedor principal */}
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
              role="dialog"
              aria-modal="true"
              aria-label={`Editar rol ${form.nombreRol}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Editar rol: {role.NombreRol}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scroll"
              >
                {/* Nombre y descripción */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del rol
                    </label>
                    <input
                      type="text"
                      name="nombreRol"
                      value={form.nombreRol}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-black"
                      placeholder="Nombre del rol"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-black"
                      rows={3}
                      placeholder="Descripción del rol"
                      required
                    />
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
                    <h3 className="text-lg font-semibold text-gray-800">
                      Asignar permisos y privilegios
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={Object.entries(permisosDisponibles).every(
                          ([modulo, permisos]) =>
                            permisos.every(
                              (permiso) => form.permisos[`${modulo}-${permiso}`]
                            )
                        )}
                        className="custom-checkbox"
                      />
                      <span className="text-green-700 text-sm">
                        Seleccionar todos
                      </span>
                    </label>
                  </div>
                  <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Módulo</th>
                          <th className="px-4 py-3 text-left">
                            Permisos/Privilegios
                          </th>
                          <th className="px-4 py-3 text-center">Todos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(permisosDisponibles).length > 0 ? (
                          Object.entries(permisosDisponibles).map(
                            ([modulo, permisos], i) => (
                              <tr key={i}>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {modulo}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-4">
                                    {permisos.map((permiso) => {
                                      const key = `${modulo}-${permiso}`;
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
                                            className="custom-checkbox"
                                          />
                                          <span className="text-green-600 font-medium">
                                            {permiso}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    onChange={() =>
                                      toggleSelectModule(modulo, permisos)
                                    }
                                    checked={permisos.every(
                                      (permiso) =>
                                        form.permisos[`${modulo}-${permiso}`]
                                    )}
                                    className="custom-checkbox"
                                  />
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-3 text-center text-gray-500"
                            >
                              No hay permisos disponibles
                            </td>
                          </tr>
                        )}
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
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Actualizar rol
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
