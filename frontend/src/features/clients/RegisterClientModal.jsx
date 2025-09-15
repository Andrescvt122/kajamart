import React, { useState } from "react";
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

  const tipoOptions = [
    { label: "Cédula de Ciudadanía", value: "CC" },
    { label: "Tarjeta de Identidad", value: "TI" },
    { label: "Cédula de Extranjería", value: "CE" },
    { label: "Pasaporte", value: "PP" },
  ];

 const addClient = (newClient) => {
  setClients(prevClients => [...prevClients, newClient]);
};

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Nuevo Cliente
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
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
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="border border-gray-300 px-3 py-2">{client.id}</td>
              <td className="border border-gray-300 px-3 py-2">{client.nombre}</td>
              <td className="border border-gray-300 px-3 py-2">{client.documento}</td>
              <td className="border border-gray-300 px-3 py-2">{client.correo}</td>
              <td className="border border-gray-300 px-3 py-2">{client.telefono}</td>
              <td className="border border-gray-300 px-3 py-2">{client.estado}</td>
              <td className="border border-gray-300 px-3 py-2">{client.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
