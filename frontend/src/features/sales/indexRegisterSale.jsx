import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RegisterClientModal from "../clients/RegisterClientModal";

export default function IndexRegisterSale() {
  const navigate = useNavigate();

  // --- Estados de cliente ---
  const [clienteQuery, setClienteQuery] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // --- Props para modal de cliente ---
  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    activo: true,
  });
  const [tipoOpen, setTipoOpen] = useState(false);

  // --- Productos / venta ---
  const [codigo, setCodigo] = useState("");
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);

  // Constantes
  const STORAGE_KEY = "clientes";
  const CLIENTE_CAJA_ID = "C000";

  // --- Dropdown UI control ---
  const [showDropdown, setShowDropdown] = useState(false);
  const sugRef = useRef(null);
  const inputRef = useRef(null);

  // --- Carga inicial de clientes ---
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!stored.find((c) => c.id === CLIENTE_CAJA_ID)) {
      const caja = {
        id: CLIENTE_CAJA_ID,
        nombre: "Cliente de Caja",
        tipoDocumento: "N/A",
        numeroDocumento: "N/A",
        correo: "caja@correo.com",
        telefono: "N/A",
        estado: "Activo",
        fecha: new Date().toISOString().split("T")[0],
      };
      const withCaja = [caja, ...stored];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withCaja));
      setClientes(withCaja);
      setClienteSeleccionado(caja);
    } else {
      setClientes(stored);
      const caja = stored.find((c) => c.id === CLIENTE_CAJA_ID);
      if (caja) setClienteSeleccionado(caja);
    }
  }, []);

  // --- Normalizar texto ---
  const normalize = (t) =>
    String(t ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // --- Calcular sugerencias ---
  const suggestions = clienteQuery.trim()
    ? clientes.filter((c) =>
        normalize(`${c.id} ${c.nombre} ${c.numeroDocumento} ${c.correo}`).includes(
          normalize(clienteQuery)
        )
      )
    : [];

  // --- Cerrar dropdown al click fuera ---
  useEffect(() => {
    function handleDocClick(e) {
      if (
        sugRef.current &&
        !sugRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  // --- Cambios en input ---
  const handleInputChange = (val) => {
    setClienteQuery(val);
    setClienteSeleccionado(null);
    if (val.trim()) setShowDropdown(true);
    else setShowDropdown(false);
  };

  // --- Seleccionar sugerencia ---
  const handleSelectSuggestion = (c) => {
    setClienteSeleccionado(c);
    setClienteQuery(c.nombre);
    setShowDropdown(false);
  };

  // --- Blur del input ---
  const handleBlurCliente = () => {
    const q = clienteQuery.trim();
    if (!q) {
      const caja = clientes.find((c) => c.id === CLIENTE_CAJA_ID);
      setClienteSeleccionado(caja || null);
      setShowDropdown(false);
      return;
    }
    const byId = clientes.find((c) => c.id.toLowerCase() === q.toLowerCase());
    if (byId) {
      setClienteSeleccionado(byId);
      setClienteQuery(byId.nombre);
      setShowDropdown(false);
      return;
    }
    const byDoc = clientes.find((c) => String(c.numeroDocumento) === q);
    if (byDoc) {
      setClienteSeleccionado(byDoc);
      setClienteQuery(byDoc.nombre);
      setShowDropdown(false);
      return;
    }
    const byName = clientes.find((c) =>
      normalize(c.nombre).includes(normalize(q))
    );
    if (byName) {
      setClienteSeleccionado(byName);
      setClienteQuery(byName.nombre);
      setShowDropdown(false);
      return;
    }
    setClienteSeleccionado(null);
    setShowDropdown(false);
  };

  // --- Abrir modal ---
  const openRegisterModal = () => {
    setForm({
      nombre: clienteQuery || "",
      tipoDocumento: "",
      numeroDocumento: "",
      correo: "",
      telefono: "",
      activo: true,
    });
    setTipoOpen(false);
    setShowClientModal(true);
  };

  // --- Callback modal ---
  const addClientFromModal = (newClient) => {
    let clientCopy = { ...newClient };
    if (!clientCopy.id) {
      const maxNum = clientes.reduce((acc, c) => {
        const n = parseInt((c.id || "").replace(/\D/g, "")) || 0;
        return Math.max(acc, n);
      }, 0);
      clientCopy.id = "C" + String(maxNum + 1).padStart(3, "0");
    }
    clientCopy.estado = clientCopy.activo ? "Activo" : "Inactivo";
    clientCopy.fecha = clientCopy.fecha || new Date().toISOString().split("T")[0];

    const updated = [clientCopy, ...clientes];
    setClientes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setClienteSeleccionado(clientCopy);
    setClienteQuery(clientCopy.nombre);
    setShowClientModal(false);
    setShowDropdown(false);
  };

  // --- Productos DB ---
  const productosDB = [
    { codigo: "P001", nombre: "Producto 1", precio: 10 },
    { codigo: "P002", nombre: "Producto 2", precio: 20 },
    { codigo: "P003", nombre: "Producto 3", precio: 30 },
  ];

  // --- Buscar producto ---
  const handleSearchProduct = () => {
    if (!codigo.trim()) return;
    const producto = productosDB.find((p) => p.codigo === codigo.trim());
    if (!producto) {
      setMensaje({ tipo: "error", texto: "❌ Producto no encontrado" });
      setCodigo("");
      return;
    }
    if (productos.some((p) => p.codigo === producto.codigo)) {
      setMensaje({ tipo: "error", texto: "⚠️ El producto ya está en la lista" });
      setCodigo("");
      return;
    }
    setProductos([
      ...productos,
      { ...producto, cantidad: 1, subtotal: producto.precio },
    ]);
    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setCodigo("");
  };

  // --- Validación inmediata de cliente inactivo ---
  useEffect(() => {
    if (clienteSeleccionado && clienteSeleccionado.estado === "Inactivo") {
      setMensaje({
        tipo: "error",
        texto: `⚠️ El cliente "${clienteSeleccionado.nombre}" está inactivo y no puede realizar esta venta.`,
      });
    } else {
      setMensaje(null);
    }
  }, [clienteSeleccionado]);

  // --- Finalizar venta ---
  const handleFinalizarVenta = () => {
    if (productos.length === 0) {
      setMensaje({ tipo: "error", texto: "⚠️ Debe agregar al menos un producto" });
      return;
    }
    if (!metodoPago) {
      setMensaje({ tipo: "error", texto: "⚠️ Seleccione un método de pago" });
      return;
    }

    const clienteFinal =
      clienteSeleccionado ||
      clientes.find((c) => c.id === CLIENTE_CAJA_ID) || {
        id: CLIENTE_CAJA_ID,
        nombre: "Cliente de Caja",
        estado: "Activo",
      };

    if (clienteFinal.estado === "Inactivo") {
      setMensaje({
        tipo: "error",
        texto: `⚠️ El cliente "${clienteFinal.nombre}" está inactivo y no puede realizar compras.`,
      });
      return;
    }

    const nuevaVenta = {
      id: Date.now(),
      cliente: clienteFinal.nombre,
      clienteId: clienteFinal.id,
      productos,
      metodoPago,
      total: productos.reduce((acc, p) => acc + p.subtotal, 0),
      fecha: new Date().toLocaleString(),
    };

    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
    ventas.push(nuevaVenta);
    localStorage.setItem("ventas", JSON.stringify(ventas));

    navigate("/app/sales");
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Registro de Ventas</h2>
        <p className="text-sm text-gray-500 mt-1">
          Completa la información para registrar una nueva venta
        </p>
      </div>

      {/* Cliente */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Cliente</label>
        <div className="flex items-start gap-2 relative">
          <div style={{ flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={clienteQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={() => setTimeout(() => handleBlurCliente(), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleBlurCliente();
                }
              }}
              placeholder="Ingrese el nombre o código del cliente (ej. C000)"
              className="w-full border rounded px-3 py-2 bg-white text-black"
            />
            {/* Dropdown */}
            <div ref={sugRef}>
              {showDropdown && suggestions.length > 0 && !clienteSeleccionado && (
                <div className="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow z-30 max-h-56 overflow-auto">
                  {suggestions.slice(0, 7).map((s) => (
                    <div
                      key={s.id}
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        handleSelectSuggestion(s);
                      }}
                      className="px-3 py-2 hover:bg-green-50 cursor-pointer text-black"
                    >
                      <div className="text-sm font-medium">{s.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {s.numeroDocumento || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botón Registrar cliente */}
          {clienteQuery.trim() &&
            !clienteSeleccionado &&
            suggestions.length === 0 && (
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Registrar cliente
              </button>
            )}
        </div>

        <div className="mt-2">
          {clienteSeleccionado ? (
            <p
              className={`text-sm ${
                clienteSeleccionado.estado === "Activo"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {clienteSeleccionado.estado === "Activo"
                ? `✅ Cliente seleccionado: ${clienteSeleccionado.nombre}`
                : `❌ Cliente inactivo: ${clienteSeleccionado.nombre}`}
            </p>
          ) : clienteQuery.trim() === "" ? (
            <p className="text-sm text-gray-600">Se usará el Cliente de Caja</p>
          ) : (
            <p className="text-sm text-red-600">No se encontró cliente</p>
          )}
        </div>
      </div>

      {/* Código de producto */}
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Código de barras</label>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onBlur={handleSearchProduct}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchProduct();
            }
          }}
          placeholder="Ingrese o escanee el código de barras"
          className="w-full border rounded px-3 py-2 bg-white text-black"
        />
      </div>

      {/* Mensaje */}
      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.tipo === "ok" ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      {/* Tabla productos */}
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">Nombre</th>
            <th className="border border-gray-300 px-3 py-2">Cantidad</th>
            <th className="border border-gray-300 px-3 py-2">Precio</th>
            <th className="border border-gray-300 px-3 py-2">Subtotal</th>
            <th className="border border-gray-300 px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-gray-400 py-4">
                No hay productos
              </td>
            </tr>
          ) : (
            productos.map((prod, i) => (
              <tr key={i}>
                <td className="border px-3 py-2 text-black">{prod.nombre}</td>
                <td className="border px-3 py-2 text-center text-black">
                  <input
                    type="number"
                    min="1"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const nuevaCantidad = parseInt(e.target.value) || 1;
                      const nuevos = [...productos];
                      nuevos[i].cantidad = nuevaCantidad;
                      nuevos[i].subtotal = nuevaCantidad * nuevos[i].precio;
                      setProductos(nuevos);
                    }}
                    className="w-16 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>
                <td className="border px-3 py-2 text-center text-black">
                  ${prod.precio}
                </td>
                <td className="border px-3 py-2 text-center text-black">
                  ${prod.subtotal}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() =>
                      setProductos(productos.filter((_, idx) => idx !== i))
                    }
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Métodos de pago + Total */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold mb-2">Método de Pago</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setMetodoPago("efectivo")}
              className={`px-4 py-2 rounded text-white ${
                metodoPago === "efectivo" ? "bg-green-600" : "bg-gray-500"
              }`}
            >
              Efectivo
            </button>
            <button
              onClick={() => setMetodoPago("transferencia")}
              className={`px-4 py-2 rounded text-white ${
                metodoPago === "transferencia" ? "bg-green-600" : "bg-gray-500"
              }`}
            >
              Transferencia
            </button>
          </div>
        </div>
        <div className="text-right bg-gray-100 px-4 py-2 rounded shadow-md">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">
            ${productos.reduce((acc, p) => acc + p.subtotal, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end items-center space-x-2">
        <button
          onClick={() => navigate("/app/sales")}
          className="px-4 py-2 rounded bg-gray-500 text-white"
        >
          Cancelar
        </button>
        <button
          onClick={handleFinalizarVenta}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Finalizar Venta
        </button>
      </div>

      {/* Modal cliente */}
      <RegisterClientModal
        isModalOpen={showClientModal}
        setIsModalOpen={(open) => {
          setShowClientModal(open);
          if (!open) {
            const updated = JSON.parse(localStorage.getItem("clientes")) || [];
            setClientes(updated);
            if (clienteQuery.trim()) {
              const encontrado = updated.find(
                (c) =>
                  c.nombre.toLowerCase().includes(clienteQuery.toLowerCase()) ||
                  c.numeroDocumento === clienteQuery ||
                  c.id.toLowerCase() === clienteQuery.toLowerCase()
              );
              if (encontrado) {
                setClienteSeleccionado(encontrado);
                setClienteQuery(encontrado.nombre);
                setShowDropdown(false);
              }
            }
          }
        }}
        addClient={addClientFromModal}
        form={form}
        setForm={setForm}
        tipoOptions={[
          { value: "C.C", label: "Cédula de Ciudadanía" },
          { value: "T.I", label: "Tarjeta de Identidad" },
          { value: "C.E", label: "Cédula de Extranjería" },
        ]}
        tipoOpen={tipoOpen}
        setTipoOpen={setTipoOpen}
      />
    </div>
  );
}
