import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

const formRegisterClientReturn = () => {
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    personaType: "", // "Persona Natural" | "Persona Jurídica"
    contacto: "",
    telefono: "",
    correo: "",
    categorias: [], // multiple
    direccion: "",
    estado: "Activo",
  });

  // ============================
  // BLOQUEO DE SCROLL
  // ============================

  // BLOQUEAR SCROLL EN <body> CUANDO EL MODAL ESTÁ ABIERTO (y restaurar al cerrar)
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

  // ============================
  // ESTADOS Y REFS PARA DROPDOWNS
  // ============================

  // dropdown states + refs
  const [personaOpen, setPersonaOpen] = useState(false);
  const personaRef = useRef(null);

  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const categoriasRef = useRef(null);

  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);

  // sample categories (deduplicated)
  const categoriasOptions = Array.from(
    new Set([
      "Lácteos",
      "Carnes",
      "Bebidas",
      "Snacks",
      "Panadería",
      "Congelados",
    ])
  );

  useEffect(() => {
    // close dropdowns when clicking outside of them
    function handleOutside(e) {
      if (personaRef.current && !personaRef.current.contains(e.target))
        setPersonaOpen(false);
      if (categoriasRef.current && !categoriasRef.current.contains(e.target))
        setCategoriasOpen(false);
      if (estadoRef.current && !estadoRef.current.contains(e.target))
        setEstadoOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ============================
  // VARIANTES DE ANIMACIÓN
  // ============================

  // animation variants
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

  // ============================
  // FUNCIONES AUXILIARES
  // ============================

  // numeric-only sanitization for nit & telefono
  const sanitizeNumeric = (value) => value.replace(/\D/g, "");

  // handlers for form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "nit" || name === "telefono") {
      // keep only numbers
      const numeric = sanitizeNumeric(value);
      setForm((prev) => ({ ...prev, [name]: numeric }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // block non-numeric key presses for nit and telefono inputs
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
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const toggleCategoria = (cat) => {
    setForm((prev) => {
      const exists = prev.categorias.includes(cat);
      return {
        ...prev,
        categorias: exists
          ? prev.categorias.filter((c) => c !== cat)
          : [...prev.categorias, cat],
      };
    });
  };

  const removeCategoriaTag = (cat) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c !== cat),
    }));
  };

  const isValidEmail = (email) => {
    // simple email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ============================
  // FUNCIÓN DE ENVÍO
  // ============================

  const handleSubmit = (e) => {
    e.preventDefault();
    // validation: required fields
    const missing = [];
    if (!form.nombre.trim()) missing.push("Nombre");
    if (!form.nit.trim()) missing.push("NIT");
    if (!form.personaType.trim()) missing.push("Tipo de persona");
    if (!form.contacto.trim()) missing.push("Persona de contacto");
    if (!form.telefono.trim()) missing.push("Teléfono");
    if (!form.correo.trim()) missing.push("Correo");
    if (form.correo && !isValidEmail(form.correo))
      missing.push("Correo (inválido)");
    if (!form.categorias || form.categorias.length === 0)
      missing.push("Categorías");
    if (!form.direccion.trim()) missing.push("Dirección");
    if (!form.estado.trim()) missing.push("Estado");

    if (missing.length > 0) {
      showErrorAlert &&
        showErrorAlert(`Faltan campos obligatorios: ${missing.join(", ")}`);
      return;
    }

    // success: here you would call API / save state
    console.log("Proveedor registrado:", form);

    // reset
    setForm({
      nombre: "",
      nit: "",
      personaType: "",
      contacto: "",
      telefono: "",
      correo: "",
      categorias: [],
      direccion: "",
      estado: "Activo",
    });
    setPersonaOpen(false);
    setCategoriasOpen(false);
    setEstadoOpen(false);
    setIsModalOpen(false);
    showSuccessAlert && showSuccessAlert("Proveedor registrado");
  };

  // ============================
  // FUNCIÓN PARA ESTILOS DEL BOTÓN ESTADO
  // ============================

  // estado button classes (green/red/neutral)
  const estadoButtonClasses = () => {
    if (form.estado === "Activo")
      return "bg-green-50 text-green-700 border border-green-200 focus:ring-green-200";
    if (form.estado === "Inactivo")
      return "bg-red-50 text-red-700 border border-red-200 focus:ring-red-200";
    return "bg-white text-gray-700 border border-gray-200";
  };

  // ============================
  // JSX DEL MODAL Y FORMULARIO
  // ============================

  {
    /* Modal: Registrar Proveedor */
  }
  <AnimatePresence>
    {isModalOpen && (
      <>
        {/* overlay fijo que cubre todo el viewport — así no quedan zonas sin difuminar al scrollear */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        />

        {/* modal box centrado (usa pointer-events para que el overlay capture clicks fuera del modal) */}
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Registro de Proveedor
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
                    placeholder="Nombre del proveedor"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                    style={{ color: "#000" }}
                    required
                  />
                </div>

                {/* NIT (numérico) */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    NIT
                  </label>
                  <input
                    name="nit"
                    value={form.nit}
                    onChange={handleFormChange}
                    onKeyDown={handleNumericKeyDown}
                    inputMode="numeric"
                    placeholder="NIT / Identificación"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                    style={{ color: "#000" }}
                    required
                  />
                </div>

                {/* Persona Natural/Jurídica */}
                <div ref={personaRef}>
                  <label className="block text-sm text-gray-700 mb-1">
                    Tipo de persona
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPersonaOpen((s) => !s)}
                      className="w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                      aria-haspopup="listbox"
                      aria-expanded={personaOpen}
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
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {personaOpen && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={listVariants}
                        >
                          {["Persona Natural", "Persona Jurídica"].map(
                            (opt) => (
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
                            )
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
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
                    placeholder="Nombre contacto"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                    style={{ color: "#000" }}
                    required
                  />
                </div>

                {/* Teléfono (numérico) */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleFormChange}
                    onKeyDown={handleNumericKeyDown}
                    inputMode="numeric"
                    placeholder="Teléfono"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                    style={{ color: "#000" }}
                    required
                  />
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
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-200 focus:outline-none"
                    style={{ color: "#000" }}
                    required
                  />
                </div>

                {/* Estado (dropdown estilo consistente) */}
                <div ref={estadoRef}>
                  <label className="block text-sm text-gray-700 mb-1">
                    Estado
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEstadoOpen((s) => !s)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${estadoButtonClasses()} transition`}
                      aria-haspopup="listbox"
                      aria-expanded={estadoOpen}
                    >
                      <span
                        className={`text-sm ${
                          form.estado ? "" : "text-gray-400"
                        }`}
                      >
                        {form.estado || "Seleccionar estado"}
                      </span>
                      <motion.span
                        animate={{ rotate: estadoOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {estadoOpen && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
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
                              className={`px-4 py-3 cursor-pointer text-sm text-gray-700 ${
                                opt === "Activo"
                                  ? "hover:bg-green-50"
                                  : "hover:bg-red-50"
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

              {/* Categoria (multi select) */}
              <div ref={categoriasRef} className="mt-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Categorías
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoriasOpen((s) => !s)}
                    className="w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                    aria-haspopup="listbox"
                    aria-expanded={categoriasOpen}
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
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {categoriasOpen && (
                      <motion.ul
                        className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-auto z-50 max-h-48"
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

                {/* tags with remove (only these, not inside button) */}
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

              {/* Dirección (full width) */}
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
                  style={{ color: "#000" }}
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPersonaOpen(false);
                    setCategoriasOpen(false);
                    setEstadoOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                >
                  Registrar Proveedor
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>;
};

export default formRegisterClientReturn;
