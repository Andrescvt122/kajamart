// pages/categories/IndexCategories.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import CategoryDetailModal from "./CategoryDetailModal";
import CategoryEditModal from "./CategoryEditModal";
import CategoryDeleteModal from "./CategoryDeleteModal";
import SearchBar from "../../shared/components/searchBars/searchbar";
import CategoryRegisterModal from "./CategoryRegisterModal";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { showLoadingAlert } from "../../shared/components/alerts.jsx";

export default function IndexCategories() {
  const [categories, setCategories] = useState([
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
      descripcion:
        "Jugos, aguas minerales, refrescos y bebidas energéticas.",
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

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modales
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // FILTRO Y PAGINACIÓN
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return categories;
    if (/^activos?$/.test(s)) {
      return categories.filter((c) => c.estado.toLowerCase() === "activo");
    }
    if (/^inactivos?$/.test(s)) {
      return categories.filter((c) => c.estado.toLowerCase() === "inactivo");
    }
    return categories.filter((c) =>
      Object.values(c).some((value) =>
        String(value).toLowerCase().includes(s)
      )
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

  // ELIMINAR
  const handleDeleteConfirm = (category) => {
    showLoadingAlert("Eliminando categoría...");

    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Categoría eliminada",
        text: `${category?.nombre} se eliminó correctamente.`,
        background: "#e8f5e9",
        color: "#1b5e20",
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: true,
      });

      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setIsDeleteOpen(false);
      setSelectedCategory(null);

      setTimeout(() => {
        const newTotal = Math.max(1, Math.ceil((filtered.length - 1) / perPage));
        if (currentPage > newTotal) setCurrentPage(newTotal);
      }, 0);
    }, 900);
  };

  // REGISTRAR
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", estado: "", descripcion: "" });
  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCat = {
      id: `CAT${String(categories.length + 1).padStart(3, "0")}`,
      nombre: form.nombre || "Sin nombre",
      descripcion: form.descripcion || "",
      estado: form.estado || "Activo",
    };
    setCategories((p) => [newCat, ...p]);
    setIsModalOpen(false);
    setForm({ nombre: "", estado: "", descripcion: "" });
    setEstadoOpen(false);
    setCurrentPage(1);
  };

  // ---------- ANIMACIONES (usando tus variants) ----------
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
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
    <div className="flex min-h-screen relative">
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

      <div className="flex-1 relative min-h-screen p-8 overflow-hidden z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Categorías</h2>
            <p className="text-sm text-gray-500 mt-1">Administrador de Tienda</p>
          </div>
        </div>

        {/* Barra búsqueda + botones */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex-grow">
            <SearchBar
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          key={`${currentPage}-${searchTerm}-${filtered.length}`}
        >
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">ID Categoría</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <motion.tbody className="divide-y divide-gray-100" variants={listVariants}>
              <AnimatePresence initial={false} mode="popLayout">
                {pageItems.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No se encontraron categorías.
                    </td>
                  </motion.tr>
                ) : (
                  pageItems.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{c.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.descripcion}</td>
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
                          <EditButton
                            event={() => {
                              setSelectedCategory(c);
                              setIsEditModalOpen(true);
                            }}
                          />
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
              </AnimatePresence>
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

        {/* Modales */}
        <CategoryDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />

        <CategoryEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={selectedCategory}
          onSave={(updated) => console.log("Guardado:", updated)}
        />

        <CategoryDeleteModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedCategory(null);
          }}
          onConfirm={handleDeleteConfirm}
          category={selectedCategory}
        />

        <CategoryRegisterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRegister={(newCategory) => console.log("Registrado:", newCategory)}
        />
      </div>
    </div>
  );
}
