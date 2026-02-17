// SuplliersRegisterModal.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// hooks y alerts
import { useCreateSupplier } from "../../shared/components/hooks/suppliers/suppliers.hooks.js";
import { useCategories } from "../../shared/components/hooks/categories/categories.hooks.js";

import Swal from "sweetalert2";
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts.jsx";

export default function SuplliersRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  categoriasOptions = [],
  existingSuppliers = [], // 👈 lista de proveedores existentes para validar duplicados
}) {
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    personaType: "",
    contacto: "",
    telefono: "",
    correo: "",
    categorias: [], // ← IDs numéricos
    direccion: "",
  });

  const createMutation = useCreateSupplier();

  // categorías desde BD (solo activas)
  const {
    categories,
    loading: loadingCats,
    error: catsError,
  } = useCategories();

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
    const nameToId = new Map(
      hookOptions.map((o) => [o.label.toLowerCase(), o.id])
    );
    return categoriasOptions
      .map((name) => {
        const id = nameToId.get(String(name).trim().toLowerCase());
        return id ? { id, label: String(name).trim() } : null;
      })
      .filter(Boolean);
  }, [categoriasOptions, hookOptions]);

  const mergedCategoriasOptions =
    hookOptions.length > 0 ? hookOptions : propOptionsMapped;

  const optionsMap = useMemo(
    () => new Map(mergedCategoriasOptions.map((o) => [o.id, o.label])),
    [mergedCategoriasOptions]
  );

  const [errors, setErrors] = useState({});
  const [personaOpen, setPersonaOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  const personaRef = useRef();
  const categoriasRef = useRef();

  // --- helpers de normalización/validación ---
  const normalizeNit = (v = "") => String(v).trim().replace(/[.\-\s]/g, ""); // quita . - espacios
  const normalizePhone = (v = "") => String(v).trim().replace(/[^\d]/g, "");
  const normalizeEmail = (v = "") => String(v).trim().toLowerCase();
  const normalizeAddress = (v = "") =>
    String(v).trim().toLowerCase().replace(/\s+/g, " ");

  const isValidNitOrCedula = (v = "") => {
    const value = String(v).trim();

    // Solo caracteres permitidos
    if (!/^[0-9.\-\s]+$/.test(value)) return false;

    const plain = normalizeNit(value); // solo dígitos
    if (!plain) return false;

    // Cédula / ID: solo dígitos (sin formato)
    if (/^\d{5,15}$/.test(plain) && !value.includes("-") && !value.includes(".")) {
      return true;
    }

    // NIT con puntos y guion: XXX.XXX.XXX-Y (acepta 1..3 grupos .xxx)
    const nitDots = /^\d{1,3}(\.\d{3}){1,3}-\d$/.test(value);
    if (nitDots) return true;

    // NIT sin puntos pero con guion: 900123456-7
    const nitDash = /^\d{5,15}-\d$/.test(value);
    return nitDash;
  };

  // Cierra dropdowns si haces click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personaRef.current && !personaRef.current.contains(event.target))
        setPersonaOpen(false);
      if (categoriasRef.current && !categoriasRef.current.contains(event.target))
        setCategoriasOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "telefono") {
      // teléfono: solo dígitos
      newValue = value.replace(/[eE]/g, "").replace(/[^\d]/g, "");
    }

    if (name === "nit") {
      // nit: permite dígitos, '.', '-', espacios
      newValue = value
        .replace(/[eE]/g, "")
        .replace(/[^0-9.\-\s]/g, "")
        .replace(/\s+/g, " ");
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name !== "direccion" && !value.trim()) {
      error = "Este campo es obligatorio";
    } else if (name === "correo") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) error = "Correo inválido";
    } else if (name === "telefono") {
      if (value && !/^\d+$/.test(value)) error = "Solo se permiten números";
    } else if (name === "nit") {
      if (value && !isValidNitOrCedula(value)) {
        error = "NIT/CC inválido. Ej: 900.123.456-7 o 123456789";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleTelefonoKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const handleNitKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;
    if (!/[0-9.\-]/.test(e.key)) e.preventDefault();
  };

  // Toggle por ID
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
          value?.toString().trim() === "")
      ) {
        newErrors[key] = "Este campo es obligatorio";
      } else if (key === "correo") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) newErrors[key] = "Correo inválido";
      } else if (key === "telefono") {
        if (value && !/^\d+$/.test(value)) newErrors[key] = "Solo se permiten números";
      } else if (key === "nit") {
        if (value && !isValidNitOrCedula(value))
          newErrors[key] = "NIT/CC inválido. Ej: 900.123.456-7 o 123456789";
      }
    });

    if (!Array.isArray(form.categorias) || form.categorias.length === 0)
      newErrors.categorias = "Seleccione al menos una categoría";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDuplicates = () => {
    if (!Array.isArray(existingSuppliers) || existingSuppliers.length === 0)
      return {};

    const nitN = normalizeNit(form.nit);
    const telN = normalizePhone(form.telefono);
    const mailN = normalizeEmail(form.correo);
    const dirN = normalizeAddress(form.direccion);

    const dup = {
      nit:
        !!nitN &&
        existingSuppliers.some((s) => normalizeNit(s?.nit) === nitN),
      telefono:
        !!telN &&
        existingSuppliers.some((s) => normalizePhone(s?.telefono) === telN),
      correo:
        !!mailN &&
        existingSuppliers.some((s) => normalizeEmail(s?.correo) === mailN),
      // dirección es opcional: solo valida si el usuario escribió algo
      direccion:
        !!dirN &&
        existingSuppliers.some(
          (s) => normalizeAddress(s?.direccion) === dirN
        ),
    };

    const newErrors = {};
    if (dup.nit) newErrors.nit = "Ya existe un proveedor con este NIT/CC";
    if (dup.telefono)
      newErrors.telefono = "Ya existe un proveedor con este teléfono";
    if (dup.correo) newErrors.correo = "Ya existe un proveedor con este correo";
    if (dup.direccion)
      newErrors.direccion = "Ya existe un proveedor con esta dirección";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const dupErrors = validateDuplicates();
    if (Object.keys(dupErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...dupErrors }));
      showErrorAlert &&
        showErrorAlert(
          "Hay datos repetidos. Revisa NIT/Teléfono/Correo/Dirección."
        );
      return;
    }

    const nitNormalized = normalizeNit(form.nit);

    // payload al backend (estado SIEMPRE activo, sin max_porcentaje_de_devolucion)
    const payload = {
      nombre: form.nombre.trim(),
      nit: nitNormalized, // 👈 ahora se manda normalizado (string)
      tipo_persona: form.personaType,
      contacto: form.contacto.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
      estado: true, // 👈 siempre activo
      categorias: form.categorias,
    };

    showLoadingAlert("Registrando proveedor...");
    createMutation.mutate(payload, {
      onSuccess: () => {
        try {
          Swal.close();
        } catch (_) {}
        showSuccessAlert && showSuccessAlert("Proveedor registrado");

        if (typeof onSubmit === "function") onSubmit(payload);
        onClose && onClose();

        // Reset
        setForm({
          nombre: "",
          nit: "",
          personaType: "",
          contacto: "",
          telefono: "",
          correo: "",
          categorias: [],
          direccion: "",
        });
        setErrors({});
      },
      onError: (err) => {
        try {
          Swal.close();
        } catch (_) {}
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo registrar el proveedor.";
        showErrorAlert && showErrorAlert(msg);
      },
    });
  };

  const listVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };
  const itemVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* ⬆️ Modal más arriba y scrollable */}
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-10 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Fondo */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Contenido */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl pointer-events-auto z-50 my-6 max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Registrar Proveedor
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre</label>
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
                  <span className="text-red-500 text-xs">{errors.nombre}</span>
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
                  onKeyDown={handleNitKeyDown}
                  inputMode="tel"
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
                              setForm((prev) => ({
                                ...prev,
                                personaType: opt,
                              }));
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
                  <span className="text-red-500 text-xs">{errors.personaType}</span>
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
                  <span className="text-red-500 text-xs">{errors.contacto}</span>
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
                  onKeyDown={handleTelefonoKeyDown}
                  inputMode="numeric"
                  placeholder="Teléfono"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
                {errors.telefono && (
                  <span className="text-red-500 text-xs">{errors.telefono}</span>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Correo</label>
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
                  <span className="text-red-500 text-xs">{errors.correo}</span>
                )}
              </div>
            </div>

            {/* Categorías (IDs) */}
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
                      {loadingCats && mergedCategoriasOptions.length === 0 ? (
                        <span className="text-sm text-gray-400">
                          Cargando categorías...
                        </span>
                      ) : form.categorias.length === 0 ? (
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
                <span className="text-red-500 text-xs">{errors.categorias}</span>
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
                onBlur={handleBlur}
                placeholder="Dirección del proveedor"
                className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
              {errors.direccion && (
                <span className="text-red-500 text-xs">{errors.direccion}</span>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                disabled={createMutation.isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
