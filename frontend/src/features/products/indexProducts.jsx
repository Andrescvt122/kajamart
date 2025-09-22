// features/products/indexProducts.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import SearchBar from "../../shared/components/searchBars/searchbar";
import { motion } from "framer-motion";

import {
  showInfoAlert,
  showInputAlert,
  showLoadingAlert,
} from "../../shared/components/alerts";

import ProductRegisterModal from "./productRegisterModal.jsx";

// 👇 bloqueamos scroll horizontal global
if (typeof document !== "undefined") {
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  document.documentElement.style.width = "100%";
  document.body.style.width = "100%";
}

export default function IndexProducts() {
  const navigate = useNavigate();

  const [categories] = useState([
    { id: "CAT001", nombre: "Lácteos" },
    { id: "CAT002", nombre: "Carnes" },
    { id: "CAT003", nombre: "Bebidas" },
    { id: "CAT004", nombre: "Snacks" },
  ]);

  const [products, setProducts] = useState([
    {
      id: "P001",
      nombre: "Leche Entera 1L",
      categoria: "Lácteos",
      stockMin: 6,
      stockMax: 80,
      precio: 4200,
      estado: "Activo",
      imagen: null,
      lotes: [
        {
          id: "L001",
          barcode: "987654321001",
          vencimiento: "2024-12-01",
          stock: 10,
          stockMin: 2,
          stockMax: 20,
        },
        {
          id: "L002",
          barcode: "987654321002",
          vencimiento: "2024-12-10",
          stock: 5,
          stockMin: 1,
          stockMax: 15,
        },
        {
          id: "L003",
          barcode: "987654321003",
          vencimiento: "2024-12-20",
          stock: 6,
          stockMin: 2,
          stockMax: 18,
        },
        {
          id: "L004",
          barcode: "987654321004",
          vencimiento: "2024-12-31",
          stock: 3,
          stockMin: 1,
          stockMax: 10,
        },
      ],
    },
    {
      id: "P002",
      nombre: "Papas Fritas 80g",
      categoria: "Snacks",
      stockMin: 20,
      stockMax: 300,
      precio: 2500,
      estado: "Activo",
      imagen: null,
      lotes: [
        {
          id: "L005",
          barcode: "987654321005",
          vencimiento: "2025-01-05",
          stock: 30,
          stockMin: 10,
          stockMax: 50,
        },
        {
          id: "L006",
          barcode: "987654321006",
          vencimiento: "2025-01-15",
          stock: 40,
          stockMin: 15,
          stockMax: 60,
        },
        {
          id: "L007",
          barcode: "987654321007",
          vencimiento: "2025-01-25",
          stock: 25,
          stockMin: 10,
          stockMax: 40,
        },
        {
          id: "L008",
          barcode: "987654321008",
          vencimiento: "2025-01-30",
          stock: 35,
          stockMin: 12,
          stockMax: 50,
        },
      ],
    },
    {
      id: "P003",
      nombre: "Queso Azul 200g",
      categoria: "Lácteos",
      stockMin: 10,
      stockMax: 100,
      precio: 7500,
      estado: "Activo",
      imagen: null,
      lotes: [
        {
          id: "L009",
          barcode: "987654321009",
          vencimiento: "2024-11-15",
          stock: 15,
          stockMin: 5,
          stockMax: 25,
        },
        {
          id: "L010",
          barcode: "987654321010",
          vencimiento: "2024-11-25",
          stock: 12,
          stockMin: 5,
          stockMax: 20,
        },
        {
          id: "L011",
          barcode: "987654321011",
          vencimiento: "2024-12-05",
          stock: 8,
          stockMin: 2,
          stockMax: 15,
        },
        {
          id: "L012",
          barcode: "987654321012",
          vencimiento: "2024-12-15",
          stock: 10,
          stockMin: 3,
          stockMax: 18,
        },
      ],
    },
    {
      id: "P004",
      nombre: "Arroz 500g",
      categoria: "Alimentos",
      stockMin: 50,
      stockMax: 500,
      precio: 3200,
      estado: "Activo",
      imagen: null,
      lotes: [
        {
          id: "L013",
          barcode: "987654321013",
          vencimiento: "2025-02-10",
          stock: 100,
          stockMin: 30,
          stockMax: 150,
        },
        {
          id: "L014",
          barcode: "987654321014",
          vencimiento: "2025-02-20",
          stock: 80,
          stockMin: 20,
          stockMax: 120,
        },
        {
          id: "L015",
          barcode: "987654321015",
          vencimiento: "2025-02-28",
          stock: 70,
          stockMin: 20,
          stockMax: 100,
        },
        {
          id: "L016",
          barcode: "987654321016",
          vencimiento: "2025-03-05",
          stock: 50,
          stockMin: 15,
          stockMax: 90,
        },
      ],
    },
    {
      id: "P005",
      nombre: "Fideos 200g",
      categoria: "Alimentos",
      stockMin: 30,
      stockMax: 300,
      precio: 2800,
      estado: "Activo",
      imagen: null,
      lotes: [
        {
          id: "L017",
          barcode: "987654321017",
          vencimiento: "2024-10-10",
          stock: 40,
          stockMin: 10,
          stockMax: 60,
        },
        {
          id: "L018",
          barcode: "987654321018",
          vencimiento: "2024-10-20",
          stock: 35,
          stockMin: 10,
          stockMax: 50,
        },
        {
          id: "L019",
          barcode: "987654321019",
          vencimiento: "2024-10-30",
          stock: 25,
          stockMin: 5,
          stockMax: 40,
        },
        {
          id: "L020",
          barcode: "987654321020",
          vencimiento: "2024-11-05",
          stock: 30,
          stockMin: 10,
          stockMax: 50,
        },
      ],
    },
  ]);

  // Calculamos stockActual automáticamente sumando todos los lotes
  products.forEach((p) => {
    p.stockActual = p.lotes.reduce((acc, l) => acc + l.stock, 0);
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagenes: [],
    precioCompra: "",
    precioVenta: "",
    iva: "",
    stock: "",
    estado: "",
    categoria: "",
  });

  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const categoriaRef = useRef(null);

  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) {
        setEstadoOpen(false);
      }
      if (categoriaRef.current && !categoriaRef.current.contains(e.target)) {
        setCategoriaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    const next = [...form.imagenes, ...files].slice(0, 6);
    setForm((prev) => ({ ...prev, imagenes: next }));
  };

  const removeImageAt = (idx) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.nombre.trim() ||
      !form.precioCompra ||
      !form.precioVenta ||
      !form.stock ||
      !form.estado ||
      !form.categoria
    ) {
      showInfoAlert(
        "Por favor complete los campos obligatorios marcados con *"
      );
      return;
    }

    const newProduct = {
      id: `P${String(products.length + 1).padStart(3, "0")}`,
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      stockActual: Number(form.stock),
      stockMin: 0,
      stockMax: Number(form.stock) * 5,
      precio: Number(form.precioVenta),
      precioCompra: Number(form.precioCompra),
      iva: form.iva || "0",
      estado: form.estado,
      imagen: form.imagenes[0] ? URL.createObjectURL(form.imagenes[0]) : null,
    };

    setProducts((p) => [newProduct, ...p]);
    setForm({
      nombre: "",
      descripcion: "",
      imagenes: [],
      precioCompra: "",
      precioVenta: "",
      iva: "",
      stock: "",
      estado: "",
      categoria: "",
    });
    setIsModalOpen(false);
    setEstadoOpen(false);
    setCategoriaOpen(false);
    showLoadingAlert("Producto registrado");
  };

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return products;
    if (/^activos?$/.test(s)) {
      return products.filter((p) => p.estado.toLowerCase() === "activo");
    }
    if (/^inactivos?$/.test(s)) {
      return products.filter((p) => p.estado.toLowerCase() === "inactivo");
    }
    return products.filter((p) =>
      `${p.id} ${p.nombre} ${p.descripcion || ""} ${p.categoria} ${p.estado}`
        .toLowerCase()
        .includes(s)
    );
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // ANIMACIONES
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen">
      {/* Fondo decorativo (misma implementación que en Categories/AllProducts) */}
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

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Productos</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de Inventario
              </p>
            </div>
          </div>

          {/* Barra búsqueda + acciones */}
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex-grow">
              <SearchBar
                placeholder="Buscar productos..."
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
                Registrar Nuevo Producto
              </button>
            </div>
          </div>

          {/* Tabla productos */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table key={currentPage} className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Imagen</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Stock Actual</th>
                  <th className="px-6 py-4">Stock Mínimo</th>
                  <th className="px-6 py-4">Stock Máximo</th>
                  <th className="px-6 py-4">Precio</th>
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
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p, i) => (
                    <motion.tr
                      key={p.id + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              No img
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {p.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stockActual}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stockMin}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stockMax}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${p.precio.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                            p.estado === "Activo"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton
                            event={() =>
                              navigate(`/app/products/${p.id}/detalles`, {
                                state: { product: p }, 
                              })
                            }
                          />

                          <EditButton
                            alert={() => showLoadingAlert("Editar producto")}
                          />
                          <DeleteButton
                            alert={() => showInputAlert("Eliminar producto")}
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

      {/* Modal externo de registro */}
      <ProductRegisterModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleImages={handleImages}
        removeImageAt={removeImageAt}
        estadoOpen={estadoOpen}
        setEstadoOpen={setEstadoOpen}
        categoriaOpen={categoriaOpen}
        setCategoriaOpen={setCategoriaOpen}
        estadoRef={estadoRef}
        categoriaRef={categoriaRef}
        categories={categories}
        estadoOptions={estadoOptions}
      />
    </div>
  );
}
