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
  showInfoAlert,
  showInputAlert,
  showLoadingAlert,
} from "../../shared/components/alerts";

export default function IndexCategories() {
  const [categories] = useState([
    {
      id: "CAT001",
      nombre: "Lácteos",
      descripcion:
        "Productos derivados de la leche como queso, yogurt y mantequilla.",
      estado: "Activo",
    },
    {
      id: "CAT002",
      nombre: "Carnes",
      descripcion: "Variedad de cortes de res, cerdo y pollo frescos.",
      estado: "Inactivo",
    },
    {
      id: "CAT003",
      nombre: "Bebidas",
      descripcion: "Jugos, aguas minerales, refrescos y bebidas energéticas.",
      estado: "Activo",
    },
    {
      id: "CAT004",
      nombre: "Snacks",
      descripcion: "Papas fritas, galletas, dulces y otros productos empacados.",
      estado: "Activo",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    estado: "",
    descripcion: "",
  });

  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);

  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) {
        setEstadoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚫 Bloquear scroll cuando el modal esté abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflowY = "auto"; // ✅ vertical solo si hace falta
      document.body.style.overflowX = "hidden"; // 🚫 horizontal siempre bloqueado
    }
    return () => {
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "hidden";
    };
  }, [isModalOpen]);

  const handleOpenModal = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Categoría registrada:", form);
    setIsModalOpen(false);
    setForm({
      nombre: "",
      estado: "",
      descripcion: "",
    });
    setEstadoOpen(false);
  };

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return categories;
    return categories.filter((c) =>
      `${c.id} ${c.nombre} ${c.descripcion} ${c.estado}`
        .toLowerCase()
        .includes(s)
    );
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 🎬 Variantes animación tabla
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };
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

  // clases dinámicas para la casilla del estado dentro del modal
  const estadoButtonClasses = () => {
    if (form.estado === "Activo") {
      return "bg-green-50 text-green-700 border border-green-200 focus:ring-green-200";
    }
    if (form.estado === "Inactivo") {
      return "bg-red-50 text-red-700 border border-red-200 focus:ring-red-200";
    }
    return "bg-white text-gray-400 border border-gray-200 focus:ring-green-200";
  };

  return (
    <div className="flex min-h-screen">
      {/* Fondo ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      />
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        {/* Contenido */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Categorías</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de Tienda
              </p>
            </div>
          </div>

          {/* Barra búsqueda */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton>Excel</ExportExcelButton>
              <ExportPDFButton>PDF</ExportPDFButton>
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nueva Categoría
              </button>
            </div>
          </div>

          {/* Tabla */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table key={currentPage} className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">ID Categoría</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-gray-100"
                variants={tableVariants}
              >
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron categorías.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((c, i) => (
                    <motion.tr
                      key={c.id + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {c.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.descripcion}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                            c.estado === "Activo"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton
                            alert={() => showInfoAlert("Ver categoría")}
                          />
                          <EditButton
                            alert={() => showLoadingAlert("Editar categoría")}
                          />
                          <DeleteButton
                            alert={() => showInputAlert("Eliminar categoría")}
                          />
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className=" fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 w-full h-full p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -40 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="sticky bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Registro de Categoría
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <input
                    name="nombre"
                    value={form.nombre}
                    autoComplete="off"
                    onChange={handleChange}
                    placeholder="Nombre de la categoría"
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition"
                    required
                  />
                </div>

                {/* Estado */}
                <div className="relative" ref={estadoRef}>
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
                        {estadoOptions.map((opt) => (
                          <motion.li
                            key={opt.value}
                            variants={itemVariants}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                estado: opt.value,
                              }));
                              setEstadoOpen(false);
                            }}
                            className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50"
                          >
                            {opt.label}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Descripción */}
                <div>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción de la categoría"
                    rows="4"
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition"
                    required
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
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
                    Registrar Categoría
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
