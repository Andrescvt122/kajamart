import React, { useMemo, useState } from "react";
import Sidebar from "../../shared/sidebar";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/buttons";
import { Search, X } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/paginator";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
  showWarningAlert,
  showInfoAlert,
  showLoadingAlert,
  showInputAlert,
} from "../../shared/alerts";

export default function IndexClients() {
  const [clients] = useState([
    { id: "C001", nombre: "Sofía Rodríguez", documento: "C.C: 1234567890", telefono: "555-123-4567", estado: "Activo", fecha: "2023-01-15" },
    { id: "C002", nombre: "Carlos López", documento: "T.I: 0987654321", telefono: "555-987-6543", estado: "Inactivo", fecha: "2023-11-20" },
    { id: "C004", nombre: "Diego García", documento: "DNI: 854433211", telefono: "555-333-4444", estado: "Activo", fecha: "2023-09-28" },
    { id: "C008", nombre: "Martín Gómez", documento: "C.C: 778899001", telefono: "555-222-3333", estado: "Inactivo", fecha: "2023-10-12" },
    { id: "C009", nombre: "Valentina Ruiz", documento: "C.C: 3344556677", telefono: "555-444-5555", estado: "Activo", fecha: "2023-08-18" },
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
  };

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) =>
      `${c.id} ${c.nombre} ${c.documento} ${c.telefono} ${c.estado}`.toLowerCase().includes(s)
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        {/* Fondo de ondas */}
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
          {/* Botones de prueba para las alertas */}
          <div className="flex flex-wrap gap-4 mt-8">
            {/* Éxito */}
            <button
              onClick={() => showSuccessAlert("Se guardó correctamente 🎉")}
              className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg shadow hover:bg-[#43a047]"
            >
              Éxito
            </button>

            {/* Error */}
            <button
              onClick={() => showErrorAlert("No se pudo guardar ❌")}
              className="px-4 py-2 bg-[#b23b3b] text-white rounded-lg shadow hover:bg-[#9a2c2c]"
            >
              Error
            </button>

            {/* Confirmación */}
            <button
              onClick={async () => {
                const confirmed = await showConfirmAlert("¿Seguro que deseas continuar?");
                if (confirmed) {
                  showSuccessAlert("Confirmado ✅");
                } else {
                  showErrorAlert("Acción cancelada 🚫");
                }
              }}
              className="px-4 py-2 bg-[#6d4c41] text-white rounded-lg shadow hover:bg-[#5d4037]"
            >
              Confirmación
            </button>

            {/* Advertencia */}
            <button
              onClick={() => showWarningAlert("Debes revisar la información ⚠️")}
              className="px-4 py-2 bg-[#e68923] text-white rounded-lg shadow hover:bg-[#cf7114]"
            >
              Advertencia
            </button>

            {/* Información */}
            <button
              onClick={() => showInfoAlert("Esto es solo información ℹ️")}
              className="px-4 py-2 bg-[#4f83cc] text-white rounded-lg shadow hover:bg-[#3c6cab]"
            >
              Información
            </button>

            {/* Cargando */}
            <button
              onClick={() => showLoadingAlert("Procesando...")}
              className="px-4 py-2 bg-[#a1887f] text-white rounded-lg shadow hover:bg-[#8d6e63]"
            >
              Cargando
            </button>

            {/* Input */}
            <button
              onClick={async () => {
                const value = await showInputAlert("Escribe tu nombre:");
                if (value) {
                  showSuccessAlert(`Hola, ${value} 👋`);
                }
              }}
              className="px-4 py-2 bg-[#3e2723] text-white rounded-lg shadow hover:bg-[#2c1816]"
            >
              Input
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
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

              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No se encontraron clientes.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((c, i) => (
                    <tr key={c.id + "-" + i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{c.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.documento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.telefono}</td>
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
                      <td className="px-6 py-4 text-sm text-gray-600">{c.fecha}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton />
                          <EditButton />
                          <DeleteButton />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative">
            {/* Botón cerrar */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-black">Registro de Cliente</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <input
                  name="nombre"
                  value={form.nombre}
                  autoComplete="off"
                  onChange={handleChange}
                  placeholder="Nombre y Apellido"
                  className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 
                            focus:ring-green-200 text-black placeholder-black"
                  required
                />
              </div>

              {/* Documento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg bg-white text-black 
                              focus:ring-2 focus:ring-green-200"
                    required
                  >
                    <option value="" disabled hidden>
                      Seleccione...
                    </option>
                    <option value="C.C">Cédula de Ciudadanía</option>
                    <option value="T.I">Tarjeta de Identidad</option>
                    <option value="C.E">Cédula de Extranjería</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    name="numeroDocumento"
                    autoComplete="off"
                    value={form.numeroDocumento}
                    onChange={handleChange}
                    placeholder="Número de Documento"
                    className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 
                              focus:ring-green-200 text-black placeholder-black"
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
                  placeholder="ejemplo@gmail.com"
                  className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 
                            focus:ring-green-200 text-black placeholder-black"
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
                  placeholder="Telefono"
                  className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 
                            focus:ring-green-200 text-black placeholder-black"
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
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Registrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
