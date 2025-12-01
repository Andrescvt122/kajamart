// IndexRegisterSale.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RegisterClientModal from "../clients/RegisterClientModal";

// Hooks
import { useSearchClient } from "../../shared/components/hooks/clients/useClientSearch";
import { useSearchDetailProduct } from "../../shared/components/hooks/sales/useSearchDetailProduct";

export default function IndexRegisterSale() {
  const navigate = useNavigate();

  // --- Hooks clientes ---
  const {
    clients: apiClients,
    loading: loadingClients,
    error: errorClients,
    searchClient,
  } = useSearchClient();

  // --- Hook producto ---
  const {
    productDetail, // por si lo usas luego
    productsFound,
    loadingProduct,
    errorProduct,
    searchByName,
  } = useSearchDetailProduct();

  // --- Estados cliente ---
  const [clienteQuery, setClienteQuery] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // --- Form nuevo cliente ---
  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    activo: true,
  });

  // --- Productos ---
  const [nombreProducto, setNombreProducto] = useState("");
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);

  // Constantes
  const STORAGE_KEY = "clientes";
  const CLIENTE_CAJA_ID = "C000";

  // Dropdown cliente
  const [showDropdown, setShowDropdown] = useState(false);
  const sugRef = useRef(null);
  const inputRef = useRef(null);

  // Dropdown producto
  const [showDropdownProducto, setShowDropdownProducto] = useState(false);
  const prodSugRef = useRef(null);
  const prodInputRef = useRef(null);

  // --- Normalizador ---
  const normalize = (t) =>
    String(t ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // --- Carga inicial + cliente de caja ---
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Cliente de Caja SIEMPRE activo
    const caja = {
      id: CLIENTE_CAJA_ID,
      nombre: "Cliente de Caja",
      tipoDocumento: "N/A",
      numeroDocumento: "N/A",
      correo: "caja@correo.com",
      telefono: "N/A",
      activo: true, // 👈 IMPORTANTE
      estado: "Activo",
      fecha: new Date().toISOString().split("T")[0],
    };

    if (!stored.find((c) => c.id === CLIENTE_CAJA_ID)) {
      // No existía -> lo creamos
      const withCaja = [caja, ...stored];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withCaja));
      setClientes(withCaja);
      setClienteSeleccionado(caja);
    } else {
      // Ya existía -> lo corregimos por si no tenía activo: true
      const fixed = stored.map((c) =>
        c.id === CLIENTE_CAJA_ID
          ? { ...c, activo: true, estado: "Activo" }
          : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
      setClientes(fixed);
      setClienteSeleccionado(
        fixed.find((c) => c.id === CLIENTE_CAJA_ID) || null
      );
    }
  }, []);

  // --- Cuando llegan clientes del backend ---
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

  // --- Sugerencias cliente ---
  const safeClienteQuery = (clienteQuery ?? "").trim();

  const suggestions = safeClienteQuery
    ? clientes.filter((c) =>
        normalize(
          `${c.id ?? ""} ${c.nombre ?? ""} ${c.numeroDocumento ?? ""} ${
            c.correo ?? ""
          }`
        ).includes(normalize(safeClienteQuery))
      )
    : [];

  // --- Cerrar dropdown cliente al hacer click fuera ---
  useEffect(() => {
    function handleClick(e) {
      if (
        sugRef.current &&
        !sugRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // --- Cerrar dropdown producto al hacer click fuera ---
  useEffect(() => {
    function handleClick(e) {
      if (
        prodSugRef.current &&
        !prodSugRef.current.contains(e.target) &&
        prodInputRef.current &&
        !prodInputRef.current.contains(e.target)
      ) {
        setShowDropdownProducto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // --- Input cliente ---
  const handleInputChange = (val) => {
    const value = val ?? "";
    setClienteQuery(value);
    setClienteSeleccionado(null);

    const trimmed = value.trim();

    if (trimmed) {
      setShowDropdown(true);

      if (trimmed.length >= 2) {
        searchClient(trimmed);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // --- Seleccionar sugerencia cliente ---
  const handleSelect = (c) => {
    setClienteSeleccionado(c);
    setClienteQuery(c.nombre || "");
    setShowDropdown(false);
  };

  // --- Blur cliente ---
  const handleBlurCliente = () => {
    const q = (clienteQuery ?? "").trim();

    if (!q) {
      const caja = clientes.find((c) => c.id === CLIENTE_CAJA_ID);
      setClienteSeleccionado(caja || null);
      return;
    }

    const byName = clientes.find((c) =>
      normalize(c.nombre ?? "").includes(normalize(q))
    );

    if (byName) {
      setClienteSeleccionado(byName);
      setClienteQuery(byName.nombre || "");
      return;
    }

    setClienteSeleccionado(null);
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

  // --- Input producto: escribe y busca con hook ---
  const handleInputProductoChange = (val) => {
    const value = val ?? "";
    setNombreProducto(value);
    const trimmed = value.trim();

    if (trimmed.length >= 1) {
      setShowDropdownProducto(true);
      searchByName(trimmed);
    } else {
      setShowDropdownProducto(false);
    }
  };

  // --- Blur producto: si hay resultados, toma el primero ---
  const handleBlurProducto = () => {
    const q = (nombreProducto ?? "").trim();
    if (!q) {
      setShowDropdownProducto(false);
      return;
    }

    if (productsFound && productsFound.length > 0) {
      handleSelectProducto(productsFound[0]);
    } else {
      setShowDropdownProducto(false);
    }
  };

  // --- Seleccionar producto del dropdown ---
  const handleSelectProducto = (prod) => {
    const producto = {
      codigo:
        prod.codigo_barras_producto_compra ||
        prod.id ||
        "",
      nombre: prod.productos?.nombre || prod.nombre || "Sin nombre",
      precio: Number(
        prod.precio_venta ??
          prod.precio ??
          prod.productos?.precio_venta ??
          prod.productos?.precio ??
          0
      ),
    };

    // Evitar duplicados
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
      setShowDropdownProducto(false);
      return;
    }

    setProductos((prev) => [
      ...prev,
      { ...producto, cantidad: 1, subtotal: producto.precio },
    ]);

    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setNombreProducto("");
    setShowDropdownProducto(false);
  };

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

    const cliente =
      clienteSeleccionado || clientes.find((c) => c.id === CLIENTE_CAJA_ID);

    const nuevaVenta = {
      id: Date.now(),
      cliente: cliente.nombre,
      clienteId: cliente.id,
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
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Registro de Ventas</h2>
        <p className="text-sm text-gray-500 mt-1">Completa la información</p>
      </div>

      {/* CLIENTE INPUT */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Cliente</label>
        <div className="flex items-start gap-2 relative">
          <div style={{ flex: 1 }}>
            <input
              ref={inputRef}
              value={clienteQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={() => setTimeout(() => handleBlurCliente(), 150)}
              placeholder="Nombre o documento"
              className="w-full border rounded px-3 py-2 bg-white text-black"
            />

            {/* DROPDOWN CLIENTE */}
            <div ref={sugRef}>
              {showDropdown &&
                suggestions.length > 0 &&
                !clienteSeleccionado && (
                  <div className="absolute left-0 right-0 bg-white border rounded mt-1 shadow z-30 max-h-56 overflow-auto">
                    {suggestions.slice(0, 7).map((s) => (
                      <div
                        key={s.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(s);
                        }}
                        className="px-3 py-2 hover:bg-green-50 cursor-pointer text-black"
                      >
                        <div>{s.nombre}</div>
                        <div className="text-xs text-gray-500">
                          {s.numeroDocumento}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* BOTÓN REGISTRAR */}
          {safeClienteQuery &&
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

        {/* ESTADO CLIENTE */}
        <div className="mt-2">
          {loadingClients && (
            <p className="text-sm text-gray-500">Buscando...</p>
          )}
          {errorClients && (
            <p className="text-sm text-red-600">Error: {errorClients}</p>
          )}

          {clienteSeleccionado ? (
            <p className="text-sm text-green-600">
              ✅ Cliente seleccionado: {clienteSeleccionado.nombre}
            </p>
          ) : safeClienteQuery === "" ? (
            <p className="text-sm text-gray-600">Se usará Cliente de Caja</p>
          ) : (
            <p className="text-sm text-red-600">No se encontró cliente</p>
          )}
        </div>
      </div>

      {/* PRODUCTO INPUT */}
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Producto</label>

        <div className="relative">
          <input
            ref={prodInputRef}
            type="text"
            value={nombreProducto}
            onChange={(e) => handleInputProductoChange(e.target.value)}
            onBlur={() => setTimeout(() => handleBlurProducto(), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (productsFound && productsFound.length > 0) {
                  handleSelectProducto(productsFound[0]);
                }
              }
            }}
            placeholder="Ingrese el nombre del producto"
            className="w-full border rounded px-3 py-2 bg-white text-black"
          />

          {/* DROPDOWN PRODUCTO */}
          <div ref={prodSugRef}>
            {showDropdownProducto &&
              productsFound &&
              productsFound.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border rounded mt-1 shadow z-30 max-h-56 overflow-auto">
                  {productsFound.slice(0, 7).map((p) => (
                    <div
                      key={p.id || p.codigo_barras_producto_compra}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProducto(p);
                      }}
                      className="px-3 py-2 hover:bg-green-50 cursor-pointer text-black"
                    >
                      <div>{p.productos?.nombre || p.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {p.codigo_barras_producto_compra || p.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* ESTADO PRODUCTO */}
        <div className="mt-1">
          {loadingProduct && (
            <p className="text-sm text-gray-500">Buscando producto...</p>
          )}
          {errorProduct && (
            <p className="text-sm text-red-600">{errorProduct}</p>
          )}
        </div>
      </div>

      {/* MENSAJE GENERAL */}
      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.tipo === "ok" ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      {/* TABLA PRODUCTOS */}
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Cant.</th>
            <th className="border px-3 py-2">Precio</th>
            <th className="border px-3 py-2">Subtotal</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-400">
                No hay productos
              </td>
            </tr>
          ) : (
            productos.map((p, i) => (
              <tr key={i}>
                <td className="border px-3 py-2 text-black">{p.nombre}</td>
                <td className="border px-3 py-2 text-center text-black">
                  <input
                    type="number"
                    value={p.cantidad === "" ? "" : p.cantidad}
                    min="1"
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductos((prev) => {
                        const arr = [...prev];

                        if (value === "") {
                          // permitir vacío mientras escribe
                          arr[i].cantidad = "";
                          arr[i].subtotal = 0;
                        } else {
                          const cant = Math.max(
                            1,
                            parseInt(value, 10) || 1
                          );
                          arr[i].cantidad = cant;
                          arr[i].subtotal = cant * arr[i].precio;
                        }

                        return arr;
                      });
                    }}
                    onBlur={() => {
                      // si quedó vacío, devolver a 1
                      setProductos((prev) => {
                        const arr = [...prev];
                        if (
                          arr[i].cantidad === "" ||
                          arr[i].cantidad == null ||
                          isNaN(arr[i].cantidad)
                        ) {
                          arr[i].cantidad = 1;
                          arr[i].subtotal = 1 * arr[i].precio;
                        }
                        return arr;
                      });
                    }}
                    className="w-16 text-center border rounded bg-white"
                  />
                </td>
                <td className="border px-3 py-2 text-center text-black">
                  ${p.precio}
                </td>
                <td className="border px-3 py-2 text-center text-black">
                  ${p.subtotal}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() =>
                      setProductos((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MÉTODO DE PAGO */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold mb-2">Método de Pago</p>
          <div className="flex gap-2">
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

        <div className="bg-gray-100 px-4 py-2 rounded shadow-md text-right">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">
            $
            {productos
              .reduce((acc, p) => acc + p.subtotal, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-2">
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

      {/* MODAL CLIENTE */}
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
        onSuccess={(payload) => {
          const raw = payload?.cliente || payload?.client || payload || {};

          const nuevoCliente = {
            id: raw.id ?? raw.id_cliente ?? raw.codigo ?? Date.now(),
            nombre: raw.nombre ?? raw.nombre_cliente ?? "",
            tipoDocumento: raw.tipoDocumento ?? raw.tipo_documento ?? "",
            numeroDocumento:
              raw.numeroDocumento ?? raw.numero_documento ?? "",
            correo: raw.correo ?? raw.email ?? "",
            telefono: raw.telefono ?? raw.celular ?? "",
            estado:
              raw.estado ?? ((raw.activo ?? true) ? "Activo" : "Inactivo"),
            fecha: raw.fecha || new Date().toISOString().split("T")[0],
          };

          setClientes((prev) => [...prev, nuevoCliente]);
          setClienteSeleccionado(nuevoCliente);
          setClienteQuery(nuevoCliente.nombre || "");

          setShowClientModal(false);
          setShowDropdown(false);
        }}
      />
    </div>
  );
}
