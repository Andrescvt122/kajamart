// pages/suppliers/SuplliersEditModal.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Hooks
import { useCategories } from "../../shared/components/hooks/categories/categories.hooks.js";
import { useUpdateSupplier } from "../../shared/components/hooks/suppliers/suppliers.hooks.js";

// Alerts
import Swal from "sweetalert2";
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts.jsx";

export default function SuppliersEditModal({
  isModalOpen,
  onClose,
  onSubmit, // opcional
  supplierData,
  categoriasOptions,
}) {
  // ---- CATEGORÍAS DESDE HOOK ----
  const { categories, loading: loadingCats, error: catsError } = useCategories();

  const hookOptions = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .filter((c) => c.estado === "Activo")
      .map((c) => ({
        id: Number(c.id_categoria),
        label: (c.nombre || "").trim(),
      }))
      .filter((o) => o.id && o.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const propOptionsMapped = useMemo(() => {
    if (
      !Array.isArray(categoriasOptions) ||
      categoriasOptions.length === 0 ||
      hookOptions.length === 0
    ) {
      return [];
    }
    const nameToId = new Map(hookOptions.map((o) => [o.label.toLowerCase(), o.id]));
    return categoriasOptions
      .map((name) => {
        const id = nameToId.get(String(name).trim().toLowerCase());
        return id ? { id, label: String(name).trim() } : null;
      })
      .filter(Boolean);
  }, [categoriasOptions, hookOptions]);

  const mergedCategoriasOptions = hookOptions.length > 0 ? hookOptions : propOptionsMapped;

  const optionsMap = useMemo(
    () => new Map(mergedCategoriasOptions.map((o) => [o.id, o.label])),
    [mergedCategoriasOptions]
  );

  // ---- FORM STATE ----
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    personaType: "",
    contacto: "",
    telefono: "",
    correo: "",
    estado: "Activo",
    categorias: [], // IDs numéricos
    direccion: "",
  });

  // Precarga desde supplierData
  useEffect(() => {
    if (!supplierData) return;

    const estadoStr =
      typeof supplierData.estado === "boolean"
        ? supplierData.estado
          ? "Activo"
          : "Inactivo"
        : supplierData.estado || "Activo";

    const nitStr = supplierData.nit != null ? String(supplierData.nit) : "";
    const telStr =
      supplierData.telefono != null ? String(supplierData.telefono) : "";

    // categorias del proveedor -> a IDs
    let preselectedIds = [];
    if (Array.isArray(supplierData.categorias) && supplierData.categorias.length > 0) {
      const raw = supplierData.categorias;
      if (typeof raw[0] === "object" && raw[0] !== null && "id_categoria" in raw[0]) {
        preselectedIds = raw.map((c) => Number(c.id_categoria)).filter(Boolean);
      } else if (typeof raw[0] === "number") {
        preselectedIds = raw.map((x) => Number(x)).filter(Boolean);
      } else if (typeof raw[0] === "string") {
        preselectedIds = raw
          .map((name) => {
            const entry = mergedCategoriasOptions.find(
              (opt) =>
                opt.label.toLowerCase() === String(name).trim().toLowerCase()
            );
            return entry ? entry.id : null;
          })
          .filter(Boolean);
      }
    }

    setForm({
      nombre: supplierData.nombre || "",
      nit: nitStr,
      personaType: supplierData.tipo_persona || "",
      contacto: supplierData.contacto || "",
      telefono: telStr,
      correo: supplierData.correo || "",
      estado: estadoStr || "Activo",
      categorias: preselectedIds,
      direccion: supplierData.direccion || "",
    });
  }, [supplierData, mergedCategoriasOptions]);

  // ---- DROPDOWNS & VALIDACIÓN ----
  const [errors, setErrors] = useState({});
  const [personaOpen, setPersonaOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  const personaRef = useRef();
  const estadoRef = useRef();
  const categoriasRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personaRef.current && !personaRef.current.contains(event.target))
        setPersonaOpen(false);
      if (estadoRef.current && !estadoRef.current.contains(event.target))
        setEstadoOpen(false);
      if (categoriasRef.current && !categoriasRef.current.contains(event.target))
        setCategoriasOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "nit" || name === "telefono") {
      newValue = value.replace(/[eE]/g, "");
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name !== "direccion" && !String(value || "").trim()) {
      error = "Este campo es obligatorio";
    } else if (name === "correo") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) error = "Correo inválido";
    } else if (name === "telefono" || name === "nit") {
      if (value && !/^\d+$/.test(value)) error = "Solo se permiten números";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleNumericKeyDown = (e) => {
    if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab")
      e.preventDefault();
  };

  const toggleCategoria = (categoriaId) => {
    setForm((prev) => {
      const id = Number(categoriaId);
      const exists = prev.categorias.includes(id);
      return {
        ...prev,
        categorias: exists
          ? prev.categorias.filter((c) => c !== id)
          : [...prev.categorias, id],
      };
    });
    setErrors((prev) => ({ ...prev, categorias: "" }));
  };

  const removeCategoriaTag = (categoriaId) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c !== Number(categoriaId)),
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (
        key !== "direccion" &&
        (value === null ||
          value === undefined ||
          String(value).trim() === "")
      ) {
        newErrors[key] = "Este campo es obligatorio";
      } else if (key === "correo") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) newErrors[key] = "Correo inválido";
      } else if (key === "telefono" || key === "nit") {
        if (value && !/^\d+$/.test(value)) newErrors[key] = "Solo se permiten números";
      }
    });
    if (!Array.isArray(form.categorias) || form.categorias.length === 0) {
      newErrors.categorias = "Seleccione al menos una categoría";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- UPDATE MUTATION ----
  const updateMutation = useUpdateSupplier();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    if (!supplierData?.id_proveedor) {
      showErrorAlert &&
        showErrorAlert("No se encontró id_proveedor para actualizar.");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      nit: Number(form.nit),
      tipo_persona: form.personaType || null,
      contacto: form.contacto.trim() || null,
      telefono: form.telefono.trim() || null,
      correo: form.correo.trim() || null,
      direccion: form.direccion.trim() || null,
      estado: form.estado === "Activo",
      categorias: form.categorias,
      // 👇 max_porcentaje_de_devolucion eliminado
    };

    showLoadingAlert("Actualizando proveedor...");
    updateMutation.mutate(
      { id: supplierData.id_proveedor, ...payload },
      {
        onSuccess: (data) => {
          try {
            Swal.close();
          } catch (_) {}
          showSuccessAlert && showSuccessAlert("Proveedor actualizado");
          if (typeof onSubmit === "function") onSubmit(data || payload);
          onClose && onClose();
        },
        onError: (err) => {
          try {
            Swal.close();
          } catch (_) {}
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "No se pudo actualizar el proveedor.";
          showErrorAlert && showErrorAlert(msg);
        },
      }
    );
  };

  // ---- ANIMACIONES ----
  const listVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };
  const itemVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      {/* ⬆️ Modal más arriba y scrollable, igual que el de registro */}
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-10 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl pointer-events-auto z-50 my-6 max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Editar Proveedor
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  placeholder="Nombre del proveedor"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
                {errors.nombre && (
                  <span className="text-red-500 text-xs">
                    {errors.nombre}
                  </span>
                )}
              </div>

              {/* NIT */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">NIT</label>
                <input
                  name="nit"
                  value={form.nit}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  onKeyDown={handleNumericKeyDown}
                  inputMode="numeric"
                  placeholder="NIT / Identificación"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
                {errors.nit && (
                  <span className="text-red-500 text-xs">{errors.nit}</span>
                )}
              </div>

              {/* Tipo de persona */}
              <div ref={personaRef}>
                <label className="block text-sm text-gray-700 mb-1">
                  Tipo de persona
                </label>
                <div className="relative mt-1 w-full">
                  <div className="w-full border border-gray-300 bg-white rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPersonaOpen((s) => !s)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                    >
                      <span
                        className={`text-sm ${
                          form.personaType ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {form.personaType || "Seleccionar tipo"}
                      </span>
                      <motion.span
                        animate={{ rotate: personaOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={18} className="text-gray-500" />
                      </motion.span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {personaOpen && (
                      <motion.ul
                        className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={listVariants}
                      >
                        {["Persona Natural", "Persona Jurídica"].map((opt) => (
                          <motion.li
                            key={opt}
                            variants={itemVariants}
                            onClick={() => {
                              setForm((prev) => ({ ...prev, personaType: opt }));
                              setPersonaOpen(false);
                            }}
                            className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50"
                          >
                            {opt}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                {errors.personaType && (
                  <span className="text-red-500 text-xs">
                    {errors.personaType}
                  </span>
                )}
              </div>

              {/* Contacto */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Persona de contacto
                </label>
                <input
                  name="contacto"
                  value={form.contacto}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  placeholder="Nombre contacto"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
                {errors.contacto && (
                  <span className="text-red-500 text-xs">
                    {errors.contacto}
                  </span>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Teléfono de contacto
                </label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  onKeyDown={handleNumericKeyDown}
                  inputMode="numeric"
                  placeholder="Teléfono"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
                {errors.telefono && (
                  <span className="text-red-500 text-xs">
                    {errors.telefono}
                  </span>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Correo
                </label>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
                {errors.correo && (
                  <span className="text-red-500 text-xs">
                    {errors.correo}
                  </span>
                )}
              </div>

              {/* Estado */}
              <div ref={estadoRef}>
                <label className="block text-sm text-gray-700 mb-1">
                  Estado
                </label>
                <div
                  className={`relative mt-1 w-full rounded-lg border transition ${
                    form.estado === "Activo"
                      ? "border-green-500 bg-green-50"
                      : form.estado === "Inactivo"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setEstadoOpen((s) => !s)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-transparent rounded-lg text-sm focus:outline-none"
                  >
                    <span
                      className={`${
                        form.estado === "Activo"
                          ? "text-green-700 font-medium"
                          : form.estado === "Inactivo"
                          ? "text-red-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {form.estado || "Seleccionar estado"}
                    </span>
                    <motion.span
                      animate={{ rotate: estadoOpen ? 180 : 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ChevronDown
                        size={18}
                        className={`${
                          form.estado === "Activo"
                            ? "text-green-700"
                            : form.estado === "Inactivo"
                            ? "text-red-700"
                            : "text-gray-500"
                        }`}
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {estadoOpen && (
                      <motion.ul
                        className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={listVariants}
                      >
                        {["Activo", "Inactivo"].map((opt) => (
                          <motion.li
                            key={opt}
                            variants={itemVariants}
                            onClick={() => {
                              setForm((prev) => ({ ...prev, estado: opt }));
                              setEstadoOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm ${
                              opt === "Activo"
                                ? "hover:bg-green-50 text-green-700"
                                : "hover:bg-red-50 text-red-700"
                            } ${
                              form.estado === opt
                                ? opt === "Activo"
                                  ? "bg-green-100 font-medium"
                                  : "bg-red-100 font-medium"
                                : ""
                            }`}
                          >
                            {opt}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                {errors.estado && (
                  <span className="text-red-500 text-xs">
                    {errors.estado}
                  </span>
                )}
              </div>
            </div>

            {/* Categorías */}
            <div ref={categoriasRef} className="mt-2">
              <label className="block text-sm text-gray-700 mb-1">
                Categorías
              </label>

              {catsError && mergedCategoriasOptions.length === 0 && (
                <p className="text-xs text-red-600 mb-1">
                  Error al cargar categorías: {String(catsError)}
                </p>
              )}

              <div className="relative mt-1 w-full">
                <div className="w-full border border-gray-300 bg-white rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      if (loadingCats && mergedCategoriasOptions.length === 0)
                        return;
                      setCategoriasOpen((s) => !s);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                    disabled={loadingCats && mergedCategoriasOptions.length === 0}
                    title={
                      loadingCats && mergedCategoriasOptions.length === 0
                        ? "Cargando categorías..."
                        : undefined
                    }
                  >
                    <div className="flex items-center">
                      {form.categorias.length === 0 ? (
                        <span className="text-sm text-gray-400">
                          Seleccionar categorías
                        </span>
                      ) : (
                        <span className="text-sm text-gray-800">
                          {form.categorias.length} seleccionada(s)
                        </span>
                      )}
                    </div>
                    <motion.span
                      animate={{ rotate: categoriasOpen ? 180 : 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ChevronDown size={18} className="text-gray-500" />
                    </motion.span>
                  </button>
                </div>

                <AnimatePresence>
                  {categoriasOpen && (
                    <motion.ul
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-auto z-50 max-h-48"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={listVariants}
                    >
                      {mergedCategoriasOptions.length === 0 ? (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          No hay categorías disponibles
                        </li>
                      ) : (
                        mergedCategoriasOptions.map((opt) => (
                          <motion.li
                            key={opt.id}
                            variants={itemVariants}
                            onClick={() => toggleCategoria(opt.id)}
                            className="px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-green-50 flex items-center justify-between"
                          >
                            <span>{opt.label}</span>
                            {form.categorias.includes(opt.id) && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                ✓
                              </span>
                            )}
                          </motion.li>
                        ))
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {form.categorias.map((id) => (
                  <div
                    key={id}
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs"
                  >
                    <span>{optionsMap.get(id) || id}</span>
                    <button
                      type="button"
                      onClick={() => removeCategoriaTag(id)}
                      aria-label={`Eliminar ${optionsMap.get(id) || id}`}
                      className="opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {errors.categorias && (
                <span className="text-red-500 text-xs">
                  {errors.categorias}
                </span>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Dirección
              </label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleFormChange}
                placeholder="Dirección del proveedor"
                className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                disabled={updateMutation.isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
