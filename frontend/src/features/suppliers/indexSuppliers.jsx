import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/buttons";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/paginator";
import { motion } from "framer-motion";
import {
  showInfoAlert,
  showInputAlert,
  showLoadingAlert,
} from "../../shared/alerts";

export default function IndexSuppliers() {
  const [suppliers] = useState([
    {
      nit: "900123456",
      nombre: "Distribuidora Lácteos del Valle",
      contacto: "María López",
      telefono: "3101234567",
      categoria: "Lácteos",
      estado: "Activo",
    },
    {
      nit: "800987654",
      nombre: "Carnes Premium S.A.",
      contacto: "Carlos Pérez",
      telefono: "3209876543",
      categoria: "Carnes",
      estado: "Inactivo",
    },
    {
      nit: "901456789",
      nombre: "Bebidas Naturales SAS",
      contacto: "Ana Torres",
      telefono: "3156549871",
      categoria: "Bebidas",
      estado: "Activo",
    },
    {
      nit: "902111222",
      nombre: "Snacks Rápidos",
      contacto: "Luis Gómez",
      telefono: "3001122334",
      categoria: "Snacks",
      estado: "Activo",
    },
    {
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },
    {
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },{
      nit: "903333444",
      nombre: "Panadería Central",
      contacto: "Claudia Ruiz",
      telefono: "3012233445",
      categoria: "Panadería",
      estado: "Activo",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // 🔑 normalización de texto
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return suppliers;

    return suppliers.filter((p) =>
      Object.values(p).some((value) =>
        normalizeText(value).includes(s)
      )
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

  // 🎬 Variantes de animación
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Fondo de ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%", // mitad del contenedor, o puedes usar 100% si quieres que cubra todo
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      />


      {/* Contenido */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Proveedores</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administrador de proveedores
            </p>
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
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
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
                <th className="px-6 py-4">NIT</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Categoría</th>
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
                pageItems.map((s, i) => (
                  <motion.tr
                    key={s.nit + "-" + i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{s.nit}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.contacto}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.telefono}</td>
                    <td className="px-6 py-4 text-sm text-green-700">{s.categoria}</td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewButton alert={() => showInfoAlert("Detalles proveedor")} />
                        <EditButton alert={() => showLoadingAlert("Editar proveedor")} />
                        <DeleteButton alert={() => showInputAlert("Eliminar proveedor")} />
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
    </>
  );
}
