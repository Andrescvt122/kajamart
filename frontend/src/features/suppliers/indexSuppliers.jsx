import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons.jsx";
import { Search, ChevronDown } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator.jsx";
import SupplierDetailModal from "./SuplliersDetailModal.jsx";
import SuppliersEditModal from "./SuplliersEditModal.jsx";
import { motion, AnimatePresence } from "framer-motion";
import SuplliersRegisterModal from "./SuplliersRegisterModal.jsx";
import SuppliersDeleteModal from "./SuplliersDeleteModal.jsx";
// ⬇️ agrega esto arriba con los imports
import Swal from "sweetalert2";
import { showLoadingAlert } from "../../shared/components/alerts.jsx";
import { exportSuppliersToExcel } from "./helpers/exportToXls";
import { exportSuppliersToPDF } from "./helpers/exportToPdf";

import {
  showErrorAlert,
  showInfoAlert,
  showSuccessAlert,
  showWarningAlert,
} from "../../shared/components/alerts.jsx";
import SearchBar from "../../shared/components/searchBars/searchbar";

export default function IndexSuppliers() {
  // --- CORRECCIÓN: suppliers DEBE SER UN ARRAY (no array anidado) ---
  const [suppliers, setSuppliers] = useState([
    {
      nit: "200",
      nombre: "Alimentos La Abundancia",
      contacto: "María Rodríguez",
      telefono: "3104567890",
      estado: "Activo",
      tipoPersona: "Jurídica",
      correo: "contacto@abundancia.com",
      direccion: "Cra 25 #15-78 Bogotá",
      productos: [
        {
          nombre: "Leche deslactosada",
          categoria: "Lácteos",
          precio: 3200,
          stock: 300,
        },
        {
          nombre: "Pan tajado",
          categoria: "Panadería",
          precio: 4800,
          stock: 150,
        },
        {
          nombre: "Mantequilla",
          categoria: "Lácteos",
          precio: 6500,
          stock: 200,
        },
        {
          nombre: "Mantequilla",
          categoria: "Lácteos",
          precio: 6500,
          stock: 200,
        },
        {
          nombre: "Mantequilla",
          categoria: "Lácteos",
          precio: 6500,
          stock: 200,
        },
        {
          nombre: "Mantequilla",
          categoria: "Lácteos",
          precio: 6500,
          stock: 200,
        },
        {
          nombre: "Mantequilla",
          categoria: "Lácteos",
          precio: 6500,
          stock: 200,
        },
      ],
    },
    {
      nit: "201",
      nombre: "Distribuidora El Campesino",
      contacto: "Carlos Pérez",
      telefono: "3119876543",
      estado: "Inactivo",
      tipoPersona: "Natural",
      correo: "ventas@elcampesino.com",
      direccion: "Av 68 #50-90 Medellín",
      productos: [
        {
          nombre: "Tomate chonto",
          categoria: "Verduras",
          precio: 2000,
          stock: 800,
        },
        {
          nombre: "Pollo despresado",
          categoria: "Carnes",
          precio: 16000,
          stock: 120,
        },
        { nombre: "Cilantro", categoria: "Verduras", precio: 500, stock: 400 },
      ],
    },
    {
      nit: "202",
      nombre: "Refrescos Tropical",
      contacto: "Laura Martínez",
      telefono: "3201122334",
      estado: "Activo",
      tipoPersona: "Jurídica",
      correo: "info@refrescostropical.com",
      direccion: "Calle 60 #30-12 Barranquilla",
      productos: [
        {
          nombre: "Jugo de naranja",
          categoria: "Bebidas",
          precio: 2500,
          stock: 1000,
        },
        {
          nombre: "Galletas de avena",
          categoria: "Panadería",
          precio: 3500,
          stock: 500,
        },
      ],
    },
    {
      nit: "203",
      nombre: "La Gran Cosecha",
      contacto: "Andrés Gómez",
      telefono: "3129988776",
      estado: "Activo",
      tipoPersona: "Natural",
      correo: "lagrancosecha@correo.com",
      direccion: "Km 12 Vía Cali - Palmira",
      productos: [
        {
          nombre: "Queso campesino",
          categoria: "Lácteos",
          precio: 7800,
          stock: 100,
        },
        {
          nombre: "Carne molida",
          categoria: "Carnes",
          precio: 23000,
          stock: 50,
        },
        {
          nombre: "Lechuga crespa",
          categoria: "Verduras",
          precio: 1200,
          stock: 300,
        },
      ],
    },
    {
      nit: "204",
      nombre: "Panificadora San Jorge",
      contacto: "Elena Suárez",
      telefono: "3134455667",
      estado: "Activo",
      tipoPersona: "Jurídica",
      correo: "ventas@sanjorge.com",
      direccion: "Zona Industrial Cali",
      productos: [
        {
          nombre: "Pan francés",
          categoria: "Panadería",
          precio: 3000,
          stock: 600,
        },
        {
          nombre: "Leche achocolatada",
          categoria: "Bebidas",
          precio: 3500,
          stock: 400,
        },
      ],
    },
  ]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplierToDelete, setSelectedSupplierToDelete] =
    useState(null);

  const handleDeleteConfirm = (supplier) => {
    showLoadingAlert("Eliminando proveedor...");

    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Proveedor eliminado",
        text: `${supplier?.nombre} se eliminó correctamente.`,
        background: "#e8f5e9",
        color: "#1b5e20",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });

      // Eliminar por NIT en vez de id
      setSuppliers((prev) => prev.filter((s) => s.nit !== supplier.nit));
    }, 1500);
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isDetailOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isDetailOpen]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Modal & form state for suppliers
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      "Verduras",
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

  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // -------- SEARCH / FILTER: special handling for "activo"/"inactivo" --------
  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return suppliers;

    // if user typed exactly "activo" or "activos" -> only activos
    if (/^activos?$/.test(s)) {
      return suppliers.filter(
        (p) => normalizeText(String(p.estado)) === "activo"
      );
    }

    // if user typed exactly "inactivo" or "inactivos" -> only inactivos
    if (/^inactivos?$/.test(s)) {
      return suppliers.filter(
        (p) => normalizeText(String(p.estado)) === "inactivo"
      );
    }

    // otherwise search across all fields (including product names & categories)
    return suppliers.filter((p) => {
      // check top-level supplier fields
      const inSupplier = Object.values(p).some((value) => {
        // skip productos for this step (we'll check them separately)
        if (value === p.productos) return false;
        return normalizeText(String(value)).includes(s);
      });

      if (inSupplier) return true;

      // check producto fields
      if (Array.isArray(p.productos)) {
        return p.productos.some((prod) =>
          Object.values(prod).some((v) => normalizeText(String(v)).includes(s))
        );
      }

      return false;
    });
  }, [suppliers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // animation variants
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

  // estado button classes (green/red/neutral)
  const estadoButtonClasses = () => {
    if (form.estado === "Activo")
      return "bg-green-50 text-green-700 border border-green-200 focus:ring-green-200";
    if (form.estado === "Inactivo")
      return "bg-red-50 text-red-700 border border-red-200 focus:ring-red-200";
    return "bg-white text-gray-700 border border-gray-200";
  };

  // helper: get unique categories from supplier.productos
  const getSupplierCategories = (s) => {
    if (!s || !Array.isArray(s.productos) || s.productos.length === 0)
      return [];
    const cats = s.productos.map((p) =>
      (p.categoria ? String(p.categoria) : "").trim()
    );
    return Array.from(new Set(cats.filter(Boolean)));
  };

  // ----- SEARCH + ACTIONS const (optional usage) -----
  const SearchAndActions = (
    <div className="mb-6 flex items-center gap-3">
      {/* SearchBar uses className prop so it stretches to occupy available space up to the right-side buttons */}
      <SearchBar
        placeholder="Buscar proveedores..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="flex-1 min-w-0"
      />

      <div className="flex gap-2 flex-shrink-0">
        <ExportExcelButton event={() => exportSuppliersToExcel(suppliers)}>
          Excel
        </ExportExcelButton>

        <ExportPDFButton event={() => exportSuppliersToPDF(suppliers)}>
          PDF
        </ExportPDFButton>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
        >
          Registrar Nuevo Proveedor
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      />
      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Proveedores</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de tienda
              </p>
            </div>
          </div>

          {/* Barra de búsqueda + botones (renderizado desde const) */}
          {SearchAndActions}

          {/* Tabla con animación */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            key={currentPage}
          >
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">NIT</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Categorías</th>
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
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron proveedores.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((s, i) => {
                    const cats = getSupplierCategories(s);
                    // show up to 2 categories and indicate if more exist
                    const displayCats =
                      cats.length === 0
                        ? "—"
                        : cats.length <= 2
                        ? cats.join(", ")
                        : `${cats.slice(0, 2).join(", ")} +${cats.length - 2}`;
                    return (
                      <motion.tr
                        key={s.nit + "-" + i}
                        className="hover:bg-gray-50"
                        variants={rowVariants}
                      >
                        <td className="px-6 py-4 align-top text-sm text-gray-600">
                          {s.nit}
                        </td>
                        <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">
                          {s.nombre}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-green-700">
                          {s.contacto}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-600">
                          {s.telefono}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700">
                          {displayCats}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {s.estado === "Activo" ? (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <div className="inline-flex items-center gap-2">
                            <ViewButton
                              event={() => {
                                setSelectedSupplier(s);
                                setIsDetailOpen(true);
                              }}
                            />

                            <EditButton
                              event={() => {
                                setSelectedSupplier(s);
                                setIsEditOpen(true);
                              }}
                            />

                            <DeleteButton event={() => handleDeleteClick(s)} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
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

      {/* Supplier Detail Modal: PASAMOS onEdit para abrir modal de editar desde el padre */}
      <AnimatePresence>
        {isDetailOpen && selectedSupplier && (
          <SupplierDetailModal
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedSupplier(null);
            }}
            supplier={selectedSupplier}
            onEdit={(sup) => {
              // El handler padre controla cerrar detail y abrir edit
              setSelectedSupplier(sup);
              setIsDetailOpen(false);
              setIsEditOpen(true);
            }}
          />
        )}
      </AnimatePresence>
      <SuppliersDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        supplier={selectedSupplierToDelete}
      />

      {/* Suppliers Edit Modal */}
      <AnimatePresence>
        {isEditOpen && selectedSupplier && (
          <SuppliersEditModal
            isModalOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
            }}
            supplierData={selectedSupplier}
            onSubmit={(updated) => {
              console.log("Proveedor actualizado:", updated);
              setIsEditOpen(false);
            }}
            categoriasOptions={categoriasOptions}
          />
        )}
      </AnimatePresence>

      {/* Modal: Registrar Proveedor */}
      <SuplliersRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoriasOptions={categoriasOptions}
      />
    </div>
  );
}
