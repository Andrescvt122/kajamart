import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import RegisterClientModal from "./RegisterClientModal";

export default function IndexClients() {
  // Cliente especial "Caja"
  const clienteCaja = {
    id: "C000",
    nombre: "Cliente de Caja",
    tipoDocumento: "N/A",
    documento: "N/A",
    correo: "caja@correo.com",
    telefono: "N/A",
    estado: "Activo",
    fecha: new Date().toISOString().split("T")[0],
  };

  const [clients, setClients] = useState([clienteCaja]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoOpen, setTipoOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    activo: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const tipoOptions = [
    { label: "Cédula de Ciudadanía", value: "CC" },
    { label: "Tarjeta de Identidad", value: "TI" },
    { label: "Cédula de Extranjería", value: "CE" },
    { label: "Pasaporte", value: "PP" },
  ];

  const addClient = (newClient) => {
    setClients((prevClients) => [...prevClients, newClient]);
  };

  // 🔹 Filtro de búsqueda
  const filteredClients = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return clients;
    return clients.filter(
      (c) =>
        c.nombre.toLowerCase().includes(s) ||
        c.documento.toLowerCase().includes(s) ||
        c.correo.toLowerCase().includes(s)
    );
  }, [clients, searchTerm]);

  // 🔹 Animaciones Framer Motion
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 relative z-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Nuevo Cliente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Tabla de clientes */}
      <motion.table
        className="w-full border-collapse border border-gray-300"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-3 py-2">ID</th>
            <th className="border border-gray-300 px-3 py-2">Nombre</th>
            <th className="border border-gray-300 px-3 py-2">Documento</th>
            <th className="border border-gray-300 px-3 py-2">Correo</th>
            <th className="border border-gray-300 px-3 py-2">Teléfono</th>
            <th className="border border-gray-300 px-3 py-2">Estado</th>
            <th className="border border-gray-300 px-3 py-2">Fecha</th>
          </tr>
        </thead>
        <motion.tbody className="divide-y divide-gray-100">
          {filteredClients.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                No se encontraron clientes.
              </td>
            </tr>
          ) : (
            filteredClients.map((client) => (
              <motion.tr
                key={client.id}
                className="hover:bg-gray-50"
                variants={rowVariants}
              >
                <td className="border border-gray-300 px-3 py-2">{client.id}</td>
                <td className="border border-gray-300 px-3 py-2">{client.nombre}</td>
                <td className="border border-gray-300 px-3 py-2">{client.documento}</td>
                <td className="border border-gray-300 px-3 py-2">{client.correo}</td>
                <td className="border border-gray-300 px-3 py-2">{client.telefono}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                      client.estado === "Activo"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {client.estado}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2">{client.fecha}</td>
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </motion.table>

      {/* Modal */}
      <RegisterClientModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        setForm={setForm}
        tipoOptions={tipoOptions}
        tipoOpen={tipoOpen}
        setTipoOpen={setTipoOpen}
        addClient={addClient}
      />
    </div>
  );
}
