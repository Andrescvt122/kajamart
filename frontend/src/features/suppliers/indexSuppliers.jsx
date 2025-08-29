import React, { useMemo, useState } from "react";
import Sidebar from "../../shared/sidebar";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/buttons";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";

export default function IndexSuppliers() {
  const [suppliers] = useState([
    { nit: "123", nombre: "Global Foods Inc.", contacto: "Sophia Bennett", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "124", nombre: "Fresh Produce Co.", contacto: "Liam Harper", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "125", nombre: "Beverage Distributors", contacto: "Olivia Hayes", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "126", nombre: "Dairy Delights", contacto: "Noah Carter", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "127", nombre: "Meat Masters", contacto: "Ava Foster", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "128", nombre: "Snack Sensations", contacto: "Jackson Reed", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "129", nombre: "Organic Origins", contacto: "Isabella Morgan", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "130", nombre: "Frozen Foods Ltd.", contacto: "Lucas Bennett", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "131", nombre: "Bakery Bliss", contacto: "Mia Collins", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
    { nit: "132", nombre: "Candy Kingdom", contacto: "Owen Parker", telefono: "123456789", categoria: "categoria 1", estado: "Activo" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return suppliers;
    return suppliers.filter((p) =>
      `${p.nit} ${p.nombre} ${p.contacto} ${p.telefono} ${p.categoria}`.toLowerCase().includes(s)
    );
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        {/* Fondo de ondas solo en la mitad inferior */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: "50%", // Solo mitad inferior
            backgroundImage: `url(${ondas})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
            backgroundSize: "cover",
            zIndex: 0,
          }}
        />

        {/* Contenido encima */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Proveedores</h2>
              <p className="text-sm text-gray-500 mt-1">Administrador de tienda</p>
            </div>
          </div>

          {/* Barra de búsqueda + botones */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar proveedores..."
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
                onClick={() => console.log("Registrar nuevo proveedor")}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">NIT</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No se encontraron proveedores.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((s, i) => (
                    <tr key={s.nit + "-" + i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 align-top text-sm text-gray-600">{s.nit}</td>
                      <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">{s.nombre}</td>
                      <td className="px-6 py-4 align-top text-sm text-green-700">{s.contacto}</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">{s.telefono}</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">{s.categoria}</td>
                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                          {s.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-white">
              Mostrando <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * perPage, filtered.length)}</span> de{" "}
              <span className="font-medium">{filtered.length}</span>
            </div>

            <nav className="flex items-center gap-2">
              <button
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(0, 7).map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded-full border ${
                    p === currentPage ? "bg-green-100 text-green-700 border-green-200" : "bg-white text-gray-700 border-gray-200"
                  }`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
