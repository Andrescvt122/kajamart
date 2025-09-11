import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function SuppliersEditModal({
  isModalOpen,
  onClose,
  onSubmit,
  supplierData,
  categoriasOptions,
}) {
  const [form, setForm] = useState({
    nombre: supplierData?.nombre || "",
    nit: supplierData?.nit || "",
    personaType: supplierData?.personaType || "",
    contacto: supplierData?.contacto || "",
    telefono: supplierData?.telefono || "",
    correo: supplierData?.correo || "",
    estado: supplierData?.estado || "",
    categorias: supplierData?.categorias || [],
    direccion: supplierData?.direccion || "",
  });

  const [personaOpen, setPersonaOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  const personaRef = useRef();
  const estadoRef = useRef();
  const categoriasRef = useRef();

  // Cierra dropdowns si haces click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personaRef.current && !personaRef.current.contains(event.target)) {
        setPersonaOpen(false);
      }
      if (estadoRef.current && !estadoRef.current.contains(event.target)) {
        setEstadoOpen(false);
      }
      if (categoriasRef.current && !categoriasRef.current.contains(event.target)) {
        setCategoriasOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericKeyDown = (e) => {
    if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
      e.preventDefault();
    }
  };

  const toggleCategoria = (categoria) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria],
    }));
  };

  const removeCategoriaTag = (categoria) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c !== categoria),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose(); // cierra modal después de enviar
  };

  const listVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* overlay */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* modal box */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl pointer-events-auto z-50"
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
                <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                  placeholder="Nombre del proveedor"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
              </div>

              {/* NIT */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">NIT</label>
                <input
                  name="nit"
                  value={form.nit}
                  onChange={handleFormChange}
                  onKeyDown={handleNumericKeyDown}
                  inputMode="numeric"
                  placeholder="NIT / Identificación"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
              </div>

              {/* Tipo de persona */}
              <div ref={personaRef}>
                <label className="block text-sm text-gray-700 mb-1">Tipo de persona</label>
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
              </div>

              {/* Contacto */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Persona de contacto</label>
                <input
                  name="contacto"
                  value={form.contacto}
                  onChange={handleFormChange}
                  placeholder="Nombre contacto"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Teléfono de contacto</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleFormChange}
                  onKeyDown={handleNumericKeyDown}
                  inputMode="numeric"
                  placeholder="Teléfono"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Correo</label>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleFormChange}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                  required
                />
              </div>

              {/* Estado */}
              <div ref={estadoRef}>
                <label className="block text-sm text-gray-700 mb-1">Estado</label>
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
              </div>
            </div>

            {/* Categorías */}
            <div ref={categoriasRef} className="mt-2">
              <label className="block text-sm text-gray-700 mb-1">Categorías</label>
              <div className="relative mt-1 w-full">
                <div className="w-full border border-gray-300 bg-white rounded-lg">
                  <button
                    type="button"
                    onClick={() => setCategoriasOpen((s) => !s)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                  >
                    <div className="flex items-center">
                      {form.categorias.length === 0 ? (
                        <span className="text-sm text-gray-400">Seleccionar categorías</span>
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
                      {categoriasOptions.map((opt) => (
                        <motion.li
                          key={opt}
                          variants={itemVariants}
                          onClick={() => toggleCategoria(opt)}
                          className="px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-green-50 flex items-center justify-between"
                        >
                          <span>{opt}</span>
                          {form.categorias.includes(opt) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              ✓
                            </span>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {form.categorias.map((c) => (
                  <div
                    key={c}
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => removeCategoriaTag(c)}
                      aria-label={`Eliminar ${c}`}
                      className="opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Dirección</label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleFormChange}
                placeholder="Dirección del proveedor"
                className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                required
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
