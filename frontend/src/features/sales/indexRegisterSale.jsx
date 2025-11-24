import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RegisterClientModal from "../clients/RegisterClientModal";

// Hook de búsqueda en backend (clientes)
import { useSearchClient } from "../../shared/components/hooks/clients/useClientSearch";
// Hook de búsqueda de producto por nombre
import { useSearchDetailProduct } from "../../shared/components/hooks/sales/useSearchDetailProduct";

export default function IndexRegisterSale() {
  const navigate = useNavigate();

  // --- Hook de búsqueda en backend (clientes) ---
  const {
    clients: apiClients,
    loading: loadingClients,
    error: errorClients,
    searchClient,
  } = useSearchClient();

  // --- Hook de producto (solo por nombre) ---
  const {
    productDetail,
    loadingProduct,
    errorProduct,
    searchByName,
  } = useSearchDetailProduct();

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

  // --- Productos / venta ---
  // nombreProducto = lo que escribe el usuario en el input de producto
  const [nombreProducto, setNombreProducto] = useState("");
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

  // --- Carga inicial de clientes (localStorage + Cliente de Caja) ---
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

  // --- Cuando llegan clientes del backend, mezclarlos con Cliente de Caja ---
  useEffect(() => {
    if (!apiClients || apiClients.length === 0) return;

    setClientes((prev) => {
      const caja = prev.find((x) => x.id === CLIENTE_CAJA_ID);
      const sinCaja = prev.filter((x) => x.id !== CLIENTE_CAJA_ID);

      const idsApi = new Set(apiClients.map((c) => c.id));
      const otros = sinCaja.filter((c) => !idsApi.has(c.id));

      const base = caja ? [caja, ...otros] : otros;
      return [...base, ...apiClients];
    });
  }, [apiClients]);

  // --- Normalizar texto ---
  const normalize = (t) =>
    String(t ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // --- Calcular sugerencias ---
  const suggestions = clienteQuery.trim()
    ? clientes.filter((c) =>
        normalize(
          `${c.id} ${c.nombre} ${c.numeroDocumento} ${c.correo}`
        ).includes(normalize(clienteQuery))
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

  // --- Cambios en input (busca en back + dropdown) ---
  const handleInputChange = (val) => {
    setClienteQuery(val);
    setClienteSeleccionado(null);

    const trimmed = val.trim();

    if (trimmed) {
      setShowDropdown(true);
      if (trimmed.length >= 2) {
        searchClient(trimmed);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // --- Seleccionar sugerencia ---
  const handleSelectSuggestion = (c) => {
    setClienteSeleccionado(c);
    setClienteQuery(c.nombre);
    setShowDropdown(false);
  };

  // --- Blur del input cliente ---
  const handleBlurCliente = () => {
    const q = clienteQuery.trim();
    if (!q) {
      const caja = clientes.find((c) => c.id === CLIENTE_CAJA_ID);
      setClienteSeleccionado(caja || null);
      setShowDropdown(false);
      return;
    }
    const byId = clientes.find(
      (c) => c.id.toLowerCase() === q.toLowerCase()
    );
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
    setShowClientModal(true);
  };

  // --- Buscar producto (SOLO POR NOMBRE) ---
  const handleSearchProduct = () => {
    if (!nombreProducto.trim()) return;
    searchByName(nombreProducto.trim());
  };

  // --- Cuando llega un productDetail desde el backend, lo agregamos a la tabla ---
  useEffect(() => {
    if (!productDetail) return;

    const producto = {
      codigo:
        productDetail.codigo_barras_producto_compra ||
        productDetail.id ||
        "",
      nombre: productDetail.productos?.nombre || "Sin nombre",
      precio: Number(
        productDetail.precio_venta ??
          productDetail.precio ??
          productDetail.productos?.precio_venta ??
          productDetail.productos?.precio ??
          0
      ),
    };

    if (!producto.nombre) {
      setMensaje({
        tipo: "error",
        texto: "❌ El producto no tiene nombre válido",
      });
      return;
    }

    if (
      productos.some(
        (p) =>
          (producto.codigo && p.codigo === producto.codigo) ||
          p.nombre === producto.nombre
      )
    ) {
      setMensaje({
        tipo: "error",
        texto: "⚠️ El producto ya está en la lista",
      });
      setNombreProducto("");
      return;
    }

    setProductos((prev) => [
      ...prev,
      {
        ...producto,
        cantidad: 1,
        subtotal: producto.precio,
      },
    ]);
    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setNombreProducto("");
  }, [productDetail]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setMensaje({
        tipo: "error",
        texto: "⚠️ Debe agregar al menos un producto",
      });
      return;
    }
    if (!metodoPago) {
      setMensaje({
        tipo: "error",
        texto: "⚠️ Seleccione un método de pago",
      });
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
              placeholder="Ingrese el nombre o código del cliente"
              className="w-full border rounded px-3 py-2 bg-white text-black"
            />
            {/* Dropdown */}
            <div ref={sugRef}>
              {showDropdown &&
                suggestions.length > 0 &&
                !clienteSeleccionado && (
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
          {loadingClients && (
            <p className="text-sm text-gray-500">Buscando cliente...</p>
          )}
          {errorClients && (
            <p className="text-sm text-red-600">
              Error al buscar cliente: {errorClients}
            </p>
          )}

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
            <p className="text-sm text-gray-600">
              Se usará el Cliente de Caja
            </p>
          ) : (
            <p className="text-sm text-red-600">No se encontró cliente</p>
          )}
        </div>
      </div>

      {/* Producto (nombre) */}
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Producto</label>
        <input
          type="text"
          value={nombreProducto}
          onChange={(e) => setNombreProducto(e.target.value)}
          onBlur={handleSearchProduct}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchProduct();
            }
          }}
          placeholder="Ingrese el nombre del producto"
          className="w-full border rounded px-3 py-2 bg-white text-black"
        />
      </div>

      {/* Estado búsqueda de producto */}
      {loadingProduct && (
        <p className="text-sm text-gray-500 mb-1">Buscando producto...</p>
      )}
      {errorProduct && (
        <p className="text-sm text-red-600 mb-1">{errorProduct}</p>
      )}

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
                <td className="border px-3 py-2 text-black">
                  {prod.nombre}
                </td>
                <td className="border px-3 py-2 text-center text-black">
                  <input
                    type="number"
                    min="1"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const nuevaCantidad =
                        parseInt(e.target.value) || 1;
                      const nuevos = [...productos];
                      nuevos[i].cantidad = nuevaCantidad;
                      nuevos[i].subtotal =
                        nuevaCantidad * nuevos[i].precio;
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
                      setProductos(
                        productos.filter((_, idx) => idx !== i)
                      )
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
      <div className="mb-4 flex items-center justify_between">
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
                metodoPago === "transferencia"
                  ? "bg-green-600"
                  : "bg-gray-500"
              }`}
            >
              Transferencia
            </button>
          </div>
        </div>
        <div className="text-right bg-gray-100 px-4 py-2 rounded shadow-md">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">
            $
            {productos
              .reduce((acc, p) => acc + p.subtotal, 0)
              .toLocaleString()}
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
        setIsModalOpen={setShowClientModal}
        form={form}
        setForm={setForm}
        tipoOptions={[
          { value: "C.C", label: "Cédula de Ciudadanía" },
          { value: "T.I", label: "Tarjeta de Identidad" },
          { value: "C.E", label: "Cédula de Extranjería" },
        ]}
        title="Registrar cliente"
        onClose={() => setShowClientModal(false)}
        editingClientId={null}
        onSuccess={() => {
          const q = form.numeroDocumento || form.nombre;
          if (q) {
            searchClient(q);
            setClienteQuery(form.nombre);
          }
          setShowClientModal(false);
          setShowDropdown(false);
        }}
      />
    </div>
  );
}
