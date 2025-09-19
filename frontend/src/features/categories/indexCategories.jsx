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
import CategoryDetailModal from "./CategoryDetailModal";
import CategoryEditModal from "./CategoryEditModal";
import CategoryDeleteModal from "./CategoryDeleteModal";
import { motion, AnimatePresence } from "framer-motion";

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
      descripcion:
        "Papas fritas, galletas, dulces y otros productos empacados.",
      estado: "Activo",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [selectedCategory, setSelectedCategory] = useState(null);

  // 👇 FIX: agregar estados de los modales
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = (category) => {
    console.log("Eliminar:", category);
  };
  const handleViewDetail = (category) => {
    setSelectedCategory(category);
    setIsDetailOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // ---------- MODAL REGISTRAR ----------
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
    setForm({ nombre: "", estado: "", descripcion: "" });
    setEstadoOpen(false);
  };

  // ---------- FILTRO Y PAGINACIÓN ----------
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

  // ---------- ANIMACIONES ----------
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
      <div className="flex-1 relative min-h-screen p-8 overflow-hidden">
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
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton event={() => handleViewDetail(c)} />
                          <EditButton event={() => handleEdit(c)} />
                          <DeleteButton
                            event={() => {
                              setSelectedCategory(c);
                              setIsDeleteOpen(true);
                            }}
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

        {/* Modal Detalle */}
        <CategoryDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />

        {/* Modal Editar */}
        <CategoryEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={selectedCategory}
          onSave={(updated) => console.log("Guardado:", updated)}
        />
      </div>
      {/* Modal Eliminar */}

      <CategoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        category={selectedCategory}
      />

      {/* Modal Registrar */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 w-full h-full p-4"
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
                  <label className="block text-sm font-semibold text-gray-800">
                    Estado*
                  </label>

                  <div
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition
                      ${
                        form.estado === "Activo"
                          ? "border-green-500 bg-green-50"
                          : form.estado === "Inactivo"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-gray-100"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setEstadoOpen((s) => !s)}
                      className="flex w-full items-center justify-between text-sm focus:outline-none"
                      aria-haspopup="listbox"
                      aria-expanded={estadoOpen}
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
                  </div>

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
                            className={`px-4 py-3 cursor-pointer text-sm ${
                              opt.value === "Activo"
                                ? "hover:bg-green-50 text-green-700"
                                : "hover:bg-red-50 text-red-700"
                            } ${
                              form.estado === opt.value
                                ? opt.value === "Activo"
                                  ? "bg-green-100 font-medium"
                                  : "bg-red-100 font-medium"
                                : ""
                            }`}
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
