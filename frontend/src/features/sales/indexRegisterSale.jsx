// src/features/sales/indexRegisterSale.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import RegisterClientModal from "../clients/RegisterClientModal";

import { useSearchClient } from "../../shared/components/hooks/clients/useClientSearch";
import { useSearchDetailProduct } from "../../shared/components/hooks/sales/useSearchDetailProduct";
import useCreateSale from "../../shared/components/hooks/sales/useCreateSale";

export default function IndexRegisterSale() {
  const navigate = useNavigate();

  // =========================
  // Hooks
  // =========================
  const {
    clients: apiClients,
    loading: loadingClients,
    error: errorClients,
    searchClient,
  } = useSearchClient();

  const { productsFound, loadingProduct, errorProduct, searchByName } =
    useSearchDetailProduct();

  const { createSale, loading: creatingSale, error: errorCreate } =
    useCreateSale();

  // =========================
  // Constantes
  // =========================
  const STORAGE_KEY = "clientes";
  const CLIENTE_CAJA_ID = "C000";

  // =========================
  // Estado
  // =========================
  const [clienteQuery, setClienteQuery] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    activo: true,
  });

  const [nombreProducto, setNombreProducto] = useState("");
  const [productos, setProductos] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [mensaje, setMensaje] = useState(null);

  // Dropdowns
  const [showDropdownCliente, setShowDropdownCliente] = useState(false);
  const [showDropdownProducto, setShowDropdownProducto] = useState(false);

  const sugRef = useRef(null);
  const inputRef = useRef(null);
  const prodSugRef = useRef(null);
  const prodInputRef = useRef(null);

  // =========================
  // Utils
  // =========================
  const normalize = (t) =>
    String(t ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const safeClienteQuery = (clienteQuery ?? "").trim();

  // ✅ Determinar si un cliente está activo/inactivo (compat)
  const isClienteActivo = (c) => {
    if (!c) return false;
    if (String(c.id) === String(CLIENTE_CAJA_ID)) return true;

    if (typeof c.activo === "boolean") return c.activo;

    const estadoRaw =
      c.estado ??
      c.estado_cliente ??
      c.status ??
      c.activo ??
      c.estadoCliente ??
      "";

    const estado = String(estadoRaw).toLowerCase().trim();
    if (estado === "activo" || estado === "true") return true;
    if (estado === "inactivo" || estado === "false") return false;
    return true;
  };

  // ✅ Obtener stock desde cualquier forma en que venga el producto
  const getStock = (prod) => {
    const s =
      prod?.stock_producto ??
      prod?.detalle_productos?.stock_producto ??
      prod?.productos?.stock_actual ??
      prod?.detalle_productos?.productos?.stock_actual ??
      0;

    return Number(s || 0);
  };

  // ✅ Obtener ID “real” del producto detalle (para comparar duplicados)
  const getProductoId = (prod) => String(prod?.id_detalle_producto ?? prod?.id ?? "");

  const suggestionsClientes = useMemo(() => {
    if (!safeClienteQuery) return [];
    const q = normalize(safeClienteQuery);

    return clientes.filter((c) =>
      normalize(
        `${c.id ?? ""} ${c.id_cliente ?? ""} ${c.nombre ?? ""} ${c.nombre_cliente ?? ""} ${
          c.numeroDocumento ?? ""
        } ${c.numero_documento ?? ""} ${c.correo ?? ""} ${c.email ?? ""}`
      ).includes(q)
    );
  }, [clientes, safeClienteQuery]);

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + Number(p.subtotal || 0), 0),
    [productos]
  );

  // ✅ SET de ids ya seleccionados (para filtrar resultados en tiempo real)
  const selectedProductIds = useMemo(() => {
    return new Set(productos.map((p) => String(p.productoId)));
  }, [productos]);

  // ✅ Lista de resultados filtrados: no mostrar ya seleccionados
  const filteredProductsFound = useMemo(() => {
    const arr = Array.isArray(productsFound) ? productsFound : [];
    return arr.filter((p) => {
      const id = getProductoId(p);
      if (!id) return true;
      return !selectedProductIds.has(String(id));
    });
  }, [productsFound, selectedProductIds]);

  // =========================
  // Cliente de caja (local)
  // =========================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const caja = {
      id: CLIENTE_CAJA_ID,
      nombre: "Cliente de Caja",
      tipoDocumento: "N/A",
      numeroDocumento: "N/A",
      correo: "caja@correo.com",
      telefono: "N/A",
      activo: true,
      estado: "Activo",
      fecha: new Date().toISOString().split("T")[0],
    };

    const exists = stored.find((c) => c.id === CLIENTE_CAJA_ID);

    if (!exists) {
      const withCaja = [caja, ...stored];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withCaja));
      setClientes(withCaja);
      setClienteSeleccionado(caja);
      setClienteQuery(caja.nombre);
      return;
    }

    const fixed = stored.map((c) =>
      c.id === CLIENTE_CAJA_ID ? { ...c, activo: true, estado: "Activo" } : c
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
    setClientes(fixed);

    const cajaFixed = fixed.find((c) => c.id === CLIENTE_CAJA_ID) || null;
    setClienteSeleccionado(cajaFixed);
    setClienteQuery(cajaFixed?.nombre || "");
  }, []);

  // =========================
  // Merge clientes del backend
  // =========================
  useEffect(() => {
    if (!apiClients || apiClients.length === 0) return;

    setClientes((prev) => {
      const caja = prev.find((x) => x.id === CLIENTE_CAJA_ID);
      const sinCaja = prev.filter((x) => x.id !== CLIENTE_CAJA_ID);

      const idsApi = new Set(apiClients.map((c) => String(c.id ?? c.id_cliente)));
      const otros = sinCaja.filter(
        (c) => !idsApi.has(String(c.id ?? c.id_cliente))
      );

      const base = caja ? [caja, ...otros] : otros;
      return [...base, ...apiClients];
    });
  }, [apiClients]);

  // =========================
  // Click afuera (cerrar dropdown)
  // =========================
  useEffect(() => {
    const onMouseDown = (e) => {
      if (
        sugRef.current &&
        !sugRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdownCliente(false);
      }

      if (
        prodSugRef.current &&
        !prodSugRef.current.contains(e.target) &&
        prodInputRef.current &&
        !prodInputRef.current.contains(e.target)
      ) {
        setShowDropdownProducto(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // =========================
  // Cliente handlers
  // =========================
  const handleInputClienteChange = (val) => {
    const value = val ?? "";
    setClienteQuery(value);
    setClienteSeleccionado(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setShowDropdownCliente(false);
      return;
    }

    setShowDropdownCliente(true);
    if (trimmed.length >= 2) searchClient(trimmed);
  };

  const handleSelectCliente = (c) => {
    if (!isClienteActivo(c)) {
      setMensaje({
        tipo: "error",
        texto:
          "⚠️ Este cliente está inactivo. Actívalo para poder asociarlo a una venta.",
      });
      setClienteSeleccionado(null);
      setClienteQuery("");
      setShowDropdownCliente(false);
      return;
    }

    setMensaje(null);
    setClienteSeleccionado(c);
    setClienteQuery(c.nombre || c.nombre_cliente || "");
    setShowDropdownCliente(false);
  };

  const handleBlurCliente = () => {
    const q = (clienteQuery ?? "").trim();

    if (!q) {
      const caja = clientes.find((c) => c.id === CLIENTE_CAJA_ID);
      setClienteSeleccionado(caja || null);
      setClienteQuery(caja?.nombre || "");
      return;
    }

    const byName = clientes.find((c) =>
      normalize(c.nombre ?? c.nombre_cliente ?? "").includes(normalize(q))
    );

    if (byName) {
      if (!isClienteActivo(byName)) {
        setMensaje({
          tipo: "error",
          texto:
            "⚠️ Este cliente está inactivo. Actívalo para poder asociarlo a una venta.",
        });
        setClienteSeleccionado(null);
        setClienteQuery("");
        return;
      }

      setClienteSeleccionado(byName);
      setClienteQuery(byName.nombre || byName.nombre_cliente || "");
      return;
    }

    setClienteSeleccionado(null);
  };

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

  // =========================
  // Producto handlers
  // =========================
  const handleInputProductoChange = (val) => {
    const value = val ?? "";
    setNombreProducto(value);

    const trimmed = value.trim();
    if (!trimmed) {
      setShowDropdownProducto(false);
      return;
    }

    setShowDropdownProducto(true);
    searchByName(trimmed);
  };

  const handleSelectProducto = (prod) => {
    // ✅ Validación: stock 0 -> bloquear
    const stock = getStock(prod);
    if (stock <= 0) {
      setMensaje({
        tipo: "error",
        texto: "⚠️ No hay stock disponible (0). No se puede seleccionar.",
      });
      setNombreProducto("");
      setShowDropdownProducto(false);
      return;
    }

    // ✅ Validación: ya seleccionado -> bloquear
    const idDetalleProducto = prod.id_detalle_producto ?? prod.id ?? null;
    if (idDetalleProducto != null && selectedProductIds.has(String(idDetalleProducto))) {
      setMensaje({
        tipo: "error",
        texto: "⚠️ Este producto ya fue agregado.",
      });
      setNombreProducto("");
      setShowDropdownProducto(false);
      return;
    }

    const nombre =
      prod.productos?.nombre ||
      prod.nombre ||
      prod.nombre_producto ||
      "Sin nombre";

    const precioUnitario = Number(
      prod.precio_venta ??
        prod.precio ??
        prod.precio_unitario ??
        prod.productos?.precio_venta ??
        prod.productos?.precio ??
        0
    );

    const producto = {
      productoId: idDetalleProducto,
      nombre,
      precioUnitario,
    };

    setProductos((prev) => [
      ...prev,
      {
        ...producto,
        cantidad: 1,
        subtotal: precioUnitario,
      },
    ]);

    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setNombreProducto("");
    setShowDropdownProducto(false);
  };

  const handleChangeCantidad = (index, value) => {
    const cant = Math.max(1, parseInt(value || "1", 10));
    setProductos((prev) => {
      const arr = [...prev];
      arr[index].cantidad = cant;
      arr[index].subtotal = cant * Number(arr[index].precioUnitario || 0);
      return arr;
    });
  };

  const handleRemoveProducto = (index) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // Finalizar venta (POST) ✅
  // =========================
  const handleFinalizarVenta = async () => {
    setMensaje(null);

    if (productos.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Debe agregar al menos un producto.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    if (!metodoPago) {
      await Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Seleccione un método de pago.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const clienteCaja = clientes.find((c) => c.id === CLIENTE_CAJA_ID);
    const cliente = clienteSeleccionado || clienteCaja;

    if (
      cliente &&
      String(cliente.id) !== String(CLIENTE_CAJA_ID) &&
      !isClienteActivo(cliente)
    ) {
      await Swal.fire({
        icon: "error",
        title: "Cliente inactivo",
        text: "No se puede registrar la venta: el cliente está inactivo. Actívalo para continuar.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const clienteIdReal =
      cliente?.id_cliente ??
      (cliente?.id === CLIENTE_CAJA_ID ? null : cliente?.id) ??
      null;

    const payload = {
      fecha_venta: new Date().toISOString(),
      fecha: new Date().toISOString().slice(0, 10),

      clienteId: clienteIdReal,
      cliente: cliente?.nombre ?? cliente?.nombre_cliente ?? "Cliente de Caja",

      medioPago: metodoPago === "efectivo" ? "Efectivo" : "Transferencia",
      estado: "Completada",

      productos: productos.map((p) => ({
        productoId: p.productoId ?? null,
        nombre: p.nombre ?? "Sin nombre",
        cantidad: Number(p.cantidad || 1),
        precioUnitario: Number(p.precioUnitario || 0),
        subtotal: Number(
          p.subtotal ?? Number(p.cantidad || 1) * Number(p.precioUnitario || 0)
        ),
      })),
    };

    try {
      // ✅ LOADING mientras se crea la venta
      Swal.fire({
        title: "Registrando venta...",
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await createSale(payload);

      Swal.close();

// ✅ Se muestra y se redirige de inmediato (sin esperar confirmación)
Swal.fire({
  icon: "success",
  title: "Venta registrada",
  text: "✅ La venta se registró correctamente.",
  timer: 1200,
  showConfirmButton: false,
  allowOutsideClick: false,
  allowEscapeKey: false,
  timerProgressBar: true,
});

// ✅ redirige apenas aparece
navigate("/app/sales");
    } catch (e) {
      Swal.close();

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Error registrando la venta";

      await Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: msg,
        confirmButtonColor: "#16a34a",
      });

      setMensaje({
        tipo: "error",
        texto: `❌ No se pudo registrar: ${msg}`,
      });
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="relative z-10 min-h-screen flex flex-col p-6">
      {/* ✅ Overlay Loading (extra visual) */}
      {creatingSale && (
        <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 text-black">
            <p className="font-semibold">Registrando venta...</p>
            <p className="text-sm text-gray-600">Por favor espera</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Registro de Ventas</h2>
        <p className="text-sm text-gray-500 mt-1">Completa la información</p>
      </div>

      {/* Cliente */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Cliente</label>

        <div className="flex items-start gap-2 relative">
          <div className="flex-1">
            <input
              ref={inputRef}
              value={clienteQuery}
              onChange={(e) => handleInputClienteChange(e.target.value)}
              onBlur={() => setTimeout(handleBlurCliente, 150)}
              placeholder="Nombre o documento"
              className="w-full border rounded px-3 py-2 bg-white text-black"
              disabled={creatingSale}
            />

            <div ref={sugRef}>
              {showDropdownCliente &&
                suggestionsClientes.length > 0 &&
                !clienteSeleccionado && (
                  <div className="absolute left-0 right-0 bg-white border rounded mt-1 shadow z-30 max-h-56 overflow-auto">
                    {suggestionsClientes.slice(0, 7).map((s) => {
                      const activo = isClienteActivo(s);

                      return (
                        <div
                          key={String(s.id ?? s.id_cliente)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (creatingSale) return;
                            if (!activo) {
                              setMensaje({
                                tipo: "error",
                                texto:
                                  "⚠️ Este cliente está inactivo. Actívalo para poder asociarlo a una venta.",
                              });
                              return;
                            }
                            handleSelectCliente(s);
                          }}
                          className={`px-3 py-2 text-black ${
                            activo
                              ? "hover:bg-green-50 cursor-pointer"
                              : "opacity-60 cursor-not-allowed bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>{s.nombre || s.nombre_cliente}</div>
                            <span
                              className={`text-[11px] px-2 py-[2px] rounded-full font-semibold ${
                                activo
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500">
                            {s.numeroDocumento || s.numero_documento || ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>

          {safeClienteQuery &&
            !clienteSeleccionado &&
            suggestionsClientes.length === 0 && (
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-60"
                disabled={creatingSale}
              >
                Registrar cliente
              </button>
            )}
        </div>

        <div className="mt-2">
          {loadingClients && <p className="text-sm text-gray-500">Buscando...</p>}
          {errorClients && (
            <p className="text-sm text-red-600">Error: {errorClients}</p>
          )}

          {clienteSeleccionado ? (
            <p className="text-sm text-green-600">
              ✅ Cliente seleccionado:{" "}
              {clienteSeleccionado.nombre || clienteSeleccionado.nombre_cliente}
            </p>
          ) : safeClienteQuery === "" ? (
            <p className="text-sm text-gray-600">Se usará Cliente de Caja</p>
          ) : (
            <p className="text-sm text-red-600">No se encontró cliente</p>
          )}
        </div>
      </div>

      {/* Producto */}
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Producto</label>

        <div className="relative">
          <input
            ref={prodInputRef}
            type="text"
            value={nombreProducto}
            onChange={(e) => handleInputProductoChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredProductsFound?.length) handleSelectProducto(filteredProductsFound[0]);
              }
            }}
            placeholder="Ingrese el nombre del producto"
            className="w-full border rounded px-3 py-2 bg-white text-black"
            disabled={creatingSale}
          />

          <div ref={prodSugRef}>
            {showDropdownProducto && filteredProductsFound?.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border rounded mt-1 shadow z-30 max-h-56 overflow-auto">
                {filteredProductsFound.slice(0, 7).map((p) => {
                  const stock = getStock(p);
                  const sinStock = stock <= 0;

                  return (
                    <div
                      key={String(
                        p.id_detalle_producto ?? p.id ?? p.codigo_barras_producto_compra
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (creatingSale) return;
                        if (sinStock) {
                          setMensaje({
                            tipo: "error",
                            texto:
                              "⚠️ No hay stock disponible (0). No se puede seleccionar.",
                          });
                          return;
                        }
                        handleSelectProducto(p);
                      }}
                      className={`px-3 py-2 text-black ${
                        sinStock
                          ? "opacity-60 cursor-not-allowed bg-gray-50"
                          : "hover:bg-green-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>{p.productos?.nombre || p.nombre}</div>
                        <span
                          className={`text-[11px] px-2 py-[2px] rounded-full font-semibold ${
                            sinStock
                              ? "bg-red-100 text-red-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          Stock: {stock}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        ID: {p.id_detalle_producto ?? p.id ?? "N/A"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showDropdownProducto &&
              Array.isArray(productsFound) &&
              productsFound.length > 0 &&
              filteredProductsFound.length === 0 && (
                <div className="absolute left-0 right-0 bg-white border rounded mt-1 shadow z-30 px-3 py-2 text-sm text-gray-500">
                  Todos esos productos ya fueron agregados.
                </div>
              )}
          </div>
        </div>

        <div className="mt-1">
          {loadingProduct && (
            <p className="text-sm text-gray-500">Buscando producto...</p>
          )}
          {errorProduct && <p className="text-sm text-red-600">{errorProduct}</p>}
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.tipo === "ok" ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje.texto}
        </p>
      )}
      {errorCreate && <p className="text-sm text-red-600 mb-3">{errorCreate}</p>}

      {/* Tabla */}
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
              <tr key={`${p.productoId}-${i}`}>
                <td className="border px-3 py-2 text-black">{p.nombre}</td>

                <td className="border px-3 py-2 text-center text-black">
                  <input
                    type="number"
                    value={p.cantidad}
                    min="1"
                    onChange={(e) => handleChangeCantidad(i, e.target.value)}
                    className="w-16 text-center border rounded bg-white"
                    disabled={creatingSale}
                  />
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${Number(p.precioUnitario || 0).toLocaleString()}
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${Number(p.subtotal || 0).toLocaleString()}
                </td>

                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => handleRemoveProducto(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-60"
                    disabled={creatingSale}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Método de pago */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold mb-2">Método de Pago</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMetodoPago("efectivo")}
              className={`px-4 py-2 rounded text-white ${
                metodoPago === "efectivo" ? "bg-green-600" : "bg-gray-500"
              } disabled:opacity-60`}
              disabled={creatingSale}
            >
              Efectivo
            </button>

            <button
              onClick={() => setMetodoPago("transferencia")}
              className={`px-4 py-2 rounded text-white ${
                metodoPago === "transferencia" ? "bg-green-600" : "bg-gray-500"
              } disabled:opacity-60`}
              disabled={creatingSale}
            >
              Transferencia
            </button>
          </div>
        </div>

        <div className="bg-gray-100 px-4 py-2 rounded shadow-md text-right">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">
            ${total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => navigate("/app/sales")}
          className="px-4 py-2 rounded bg-gray-500 text-white disabled:opacity-60"
          disabled={creatingSale}
        >
          Cancelar
        </button>

        <button
          onClick={handleFinalizarVenta}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60"
          disabled={creatingSale}
        >
          {creatingSale ? "Registrando..." : "Finalizar Venta"}
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
        onSuccess={(payload) => {
          const raw = payload?.cliente || payload?.client || payload || {};

          const nuevoCliente = {
            id: raw.id ?? raw.codigo ?? Date.now(),
            id_cliente: raw.id_cliente ?? raw.id ?? null,
            nombre: raw.nombre ?? raw.nombre_cliente ?? "",
            nombre_cliente: raw.nombre_cliente ?? raw.nombre ?? "",
            tipoDocumento: raw.tipoDocumento ?? raw.tipo_documento ?? "",
            numeroDocumento: raw.numeroDocumento ?? raw.numero_documento ?? "",
            correo: raw.correo ?? raw.email ?? "",
            telefono: raw.telefono ?? raw.celular ?? "",
            estado: raw.estado ?? ((raw.activo ?? true) ? "Activo" : "Inactivo"),
            activo: typeof raw.activo === "boolean" ? raw.activo : undefined,
            fecha: raw.fecha || new Date().toISOString().split("T")[0],
          };

          setClientes((prev) => [...prev, nuevoCliente]);

          if (!isClienteActivo(nuevoCliente)) {
            setMensaje({
              tipo: "error",
              texto:
                "⚠️ Cliente creado como inactivo. Actívalo para poder asociarlo a una venta.",
            });
            setClienteSeleccionado(null);
            setClienteQuery("");
          } else {
            setClienteSeleccionado(nuevoCliente);
            setClienteQuery(nuevoCliente.nombre || nuevoCliente.nombre_cliente || "");
          }

          setShowClientModal(false);
          setShowDropdownCliente(false);
        }}
      />
    </div>
  );
}
