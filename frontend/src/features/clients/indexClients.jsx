
import React, { useMemo, useState, useRef, useEffect } from "react";
import Sidebar from "../../shared/components/sidebar";
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


export default function IndexClients() {
  const [clients] = useState([
    {
      id: "C001",
      nombre: "Sofía Rodríguez",
      documento: "C.C: 1234567890",
      telefono: "555-123-4567",
      estado: "Activo",
      fecha: "2023-01-15",
    },
    {
      id: "C002",
      nombre: "Carlos López",
      documento: "T.I: 0987654321",
      telefono: "555-987-6543",
      estado: "Inactivo",
      fecha: "2023-11-20",
    },
    {
      id: "C004",
      nombre: "Diego García",
      documento: "DNI: 854433211",
      telefono: "555-333-4444",
      estado: "Activo",
      fecha: "2023-09-28",
    },
    {
      id: "C008",
      nombre: "Martín Gómez",
      documento: "C.C: 778899001",
      telefono: "555-222-3333",
      estado: "Inactivo",
      fecha: "2023-10-12",
    },
    {
      id: "C009",
      nombre: "Valentina Ruiz",
      documento: "C.C: 3344556677",
      telefono: "555-444-5555",
      estado: "Activo",
      fecha: "2023-08-18",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  // Control modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    activo: false,
  });

  // Dropdown state for "Tipo de Documento"
  const [tipoOpen, setTipoOpen] = useState(false);
  const tipoRef = useRef(null);

  const tipoOptions = [
    { value: "C.C", label: "Cédula de Ciudadanía" },
    { value: "T.I", label: "Tarjeta de Identidad" },
    { value: "C.E", label: "Cédula de Extranjería" },
  ];

  useEffect(() => {
    // Close dropdown when clicking outside of it (but still inside modal)
    function handleClickOutside(e) {
      if (tipoRef.current && !tipoRef.current.contains(e.target)) {
        setTipoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Cliente registrado:", form);
    setIsModalOpen(false);
    setForm({
      nombre: "",
      tipoDocumento: "",
      numeroDocumento: "",
      correo: "",
      telefono: "",
      activo: false,
    });
    setTipoOpen(false);
  };

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) =>
      `${c.id} ${c.nombre} ${c.documento} ${c.telefono} ${c.estado}`
        .toLowerCase()
        .includes(s)
    );
  }, [clients, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 🎬 Variantes para animaciones tabla
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  // Dropdown animation variants
  const listVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { staggerChildren: 0.02 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
  };

  // Helper to get label from value
  const tipoLabel = (val) => {
    const found = tipoOptions.find((o) => o.value === val);
    return found ? found.label : "";
  };

  return (
    <div className="flex min-h-screen">
      {/* Fondo de ondas */}
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
              <h2 className="text-3xl font-semibold">Clientes</h2>
              <p className="text-sm text-gray-500 mt-1">Administrador de Clientes</p>
            </div>
          </div>

          {/* Barra búsqueda + botones */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, documento o teléfono..."
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
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Tabla con animación */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table key={currentPage} className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">ID Cliente</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha de Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No se encontraron clientes.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((c, i) => (
                    <motion.tr
                      key={c.id + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{c.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.documento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.telefono}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                            c.estado === "Activo" ? "bg-green-50 text-green-700" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.fecha}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton />
                          <EditButton />
                          <DeleteButton />
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

      {/* Modal con animación */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)} // cerrar al hacer click fuera
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -40 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()} // evita cerrar si clickean dentro
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Registro de Cliente</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <input
                    name="nombre"
                    value={form.nombre}
                    autoComplete="off"
                    onChange={handleChange}
                    placeholder="Nombre y Apellido"
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition"
                    required
                  />
                </div>

                {/* Documento: custom animated dropdown + input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative" ref={tipoRef}>
                    <button
                      type="button"
                      onClick={() => setTipoOpen((s) => !s)}
                      className="w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-200"
                      aria-haspopup="listbox"
                      aria-expanded={tipoOpen}
                    >
                      <span className={`text-sm ${form.tipoDocumento ? "text-gray-800" : "text-gray-400"}`}>
                        {form.tipoDocumento ? tipoLabel(form.tipoDocumento) : "Tipo de Documento"}
                      </span>
                      <motion.span animate={{ rotate: tipoOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {tipoOpen && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={listVariants}
                        >
                          {tipoOptions.map((opt) => (
                            <motion.li
                              key={opt.value}
                              variants={itemVariants}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, tipoDocumento: opt.value }));
                                setTipoOpen(false);
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

                  <div>
                    <input
                      type="text"
                      name="numeroDocumento"
                      autoComplete="off"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      placeholder="Número de Documento"
                      className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition"
                      required
                    />
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <input
                    type="email"
                    name="correo"
                    autoComplete="off"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="Correo Electrónico"
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition"
                    required
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    autoComplete="off"
                    onChange={handleChange}
                    placeholder="Teléfono"
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition"
                    required
                  />
                </div>
            
              {/* Checkbox Activo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                  className="h-5 w-5 appearance-none border border-gray-300 rounded bg-white 
                            checked:border-green-600 checked:after:content-['✔'] 
                            checked:after:text-green-600 checked:after:block 
                            checked:after:text-center checked:after:leading-4"
                  required
                />
                <label htmlFor="activo" className="text-sm text-black">
                  Activo
                </label>
              </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setTipoOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Registrar Cliente
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