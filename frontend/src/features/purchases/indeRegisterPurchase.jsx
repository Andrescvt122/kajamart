// IndexRegisterPurchase.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductRegisterModal from "../products/productRegisterModal";
import SuplliersRegisterModal from "../suppliers/SuplliersRegisterModal";

// ✅ Hooks reales (NO modificar hooks)
import { useSuppliers as useSuppliersQuery } from "../../shared/components/hooks/suppliers/suppliers.hooks.js";
import { useProducts as useProductsQuery } from "../../shared/components/hooks/products/products.hooks.js";

export default function IndexRegisterPurchase() {
  const navigate = useNavigate();

  // =========================
  // Carga real desde backend
  // =========================
  const {
    data: suppliersRaw = [],
    isLoading: isSuppliersLoading,
    isError: isSuppliersError,
    error: suppliersError,
  } = useSuppliersQuery();

  const {
    data: productsRaw = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProductsQuery();

  // =========================
  // Estados de compra
  // =========================
  const [proveedor, setProveedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mensajeProveedor, setMensajeProveedor] = useState(null);
  const [mensajeProducto, setMensajeProducto] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [showModalProveedor, setShowModalProveedor] = useState(false);

  // =========================
  // Filtros / buscadores
  // =========================
  const [proveedorQuery, setProveedorQuery] = useState("");
  const [productoQuery, setProductoQuery] = useState("");
  const [isProvOpen, setIsProvOpen] = useState(false);
  const [isProdOpen, setIsProdOpen] = useState(false);
  const [provActiveIndex, setProvActiveIndex] = useState(-1);
  const [prodActiveIndex, setProdActiveIndex] = useState(-1);

  const provWrapRef = useRef(null);
  const prodWrapRef = useRef(null);

  // =========================
  // Normalizadores
  // =========================
  const normalizeText = (text) =>
    String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // =========================
  // Normalizar data REAL (backend) para el buscador
  // =========================
  const proveedoresDB = useMemo(() => {
    if (!Array.isArray(suppliersRaw)) return [];
    return suppliersRaw.map((s) => ({
      ...s,
      id_proveedor: s?.id_proveedor ?? s?.id ?? s?.ID ?? null,
      nit: s?.nit != null ? String(s.nit) : "",
      nombre: s?.nombre ?? "",
      telefono: s?.telefono ?? "",
      estado: s?.estado,
    }));
  }, [suppliersRaw]);

  const productosDB = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];
    return productsRaw.map((p) => {
      // ⚠️ AJUSTE IMPORTANTE:
      // aquí intentamos obtener el precio desde varios campos comunes.
      // Si tu backend usa uno específico (ej: precio_compra), puedes dejar solo ese.
      const precio =
        Number(p?.precio ?? p?.precio_compra ?? p?.costo ?? p?.valor ?? 0) || 0;

      return {
        ...p,
        id_producto: p?.id_producto ?? p?.id ?? p?.ID ?? null,
        codigo: p?.codigo != null ? String(p.codigo) : "",
        nombre: p?.nombre ?? "",
        precio,
      };
    });
  }, [productsRaw]);

  // =========================
  // Filtrados para dropdown
  // =========================
  const proveedoresFiltrados = useMemo(() => {
    const q = normalizeText(proveedorQuery);
    if (!q) return [];
    return proveedoresDB
      .filter(
        (p) =>
          normalizeText(p.nit).includes(q) ||
          normalizeText(p.nombre).includes(q)
      )
      .slice(0, 8);
  }, [proveedorQuery, proveedoresDB]);

  const productosFiltrados = useMemo(() => {
    const q = normalizeText(productoQuery);
    if (!q) return [];
    return productosDB
      .filter(
        (p) =>
          normalizeText(p.codigo).includes(q) ||
          normalizeText(p.nombre).includes(q)
      )
      .slice(0, 10);
  }, [productoQuery, productosDB]);

  // =========================
  // Selección proveedor / producto
  // =========================
  const seleccionarProveedor = (prov) => {
    setProveedor(prov);
    setProveedorQuery(`${prov.nombre} (${prov.nit})`);
    setMensajeProveedor({
      tipo: "ok",
      texto: `✅ Proveedor seleccionado: ${prov.nombre}`,
    });
    setIsProvOpen(false);
    setProvActiveIndex(-1);
  };

  const agregarProducto = (productoEncontrado) => {
    const yaExiste = productos.some(
      (p) => p.codigo === productoEncontrado.codigo
    );

    if (!yaExiste) {
      setProductos((prev) => [
        ...prev,
        {
          ...productoEncontrado,
          cantidad: 1,
          subida: 0,
          descuento: 0,
          precioVenta: productoEncontrado.precio,
          subtotal: productoEncontrado.precio,
        },
      ]);
    }

    setMensajeProducto({
      tipo: "ok",
      texto: `✅ Producto agregado: ${productoEncontrado.nombre}`,
    });

    setProductoQuery("");
    setIsProdOpen(false);
    setProdActiveIndex(-1);
  };

  // =========================
  // Cerrar dropdown al click afuera
  // =========================
  useEffect(() => {
    const onDocClick = (e) => {
      if (provWrapRef.current && !provWrapRef.current.contains(e.target)) {
        setIsProvOpen(false);
        setProvActiveIndex(-1);
      }
      if (prodWrapRef.current && !prodWrapRef.current.contains(e.target)) {
        setIsProdOpen(false);
        setProdActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // =========================
  // Teclas (flechas / enter / escape)
  // =========================
  const onProveedorKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsProvOpen(false);
      setProvActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsProvOpen(true);
      setProvActiveIndex((prev) =>
        Math.min(prev + 1, proveedoresFiltrados.length - 1)
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setProvActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (
        isProvOpen &&
        provActiveIndex >= 0 &&
        proveedoresFiltrados[provActiveIndex]
      ) {
        e.preventDefault();
        seleccionarProveedor(proveedoresFiltrados[provActiveIndex]);
        return;
      }

      const val = proveedorQuery.trim();
      if (!val) return;

      const exacto = proveedoresDB.find((p) => p.nit === val);
      if (exacto) seleccionarProveedor(exacto);
      else {
        setMensajeProveedor({
          tipo: "error",
          texto: "❌ Proveedor no encontrado. Selecciónalo de la lista o créalo.",
        });
      }
    }
  };

  const onProductoKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsProdOpen(false);
      setProdActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsProdOpen(true);
      setProdActiveIndex((prev) =>
        Math.min(prev + 1, productosFiltrados.length - 1)
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setProdActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (
        isProdOpen &&
        prodActiveIndex >= 0 &&
        productosFiltrados[prodActiveIndex]
      ) {
        e.preventDefault();
        agregarProducto(productosFiltrados[prodActiveIndex]);
        return;
      }

      const val = normalizeText(productoQuery);
      if (!val) return;

      const exacto = productosDB.find(
        (p) =>
          normalizeText(p.codigo) === val || normalizeText(p.nombre) === val
      );
      if (exacto) agregarProducto(exacto);
      else {
        setMensajeProducto({
          tipo: "error",
          texto: "❌ Producto no encontrado. Selecciónalo de la lista o créalo.",
        });
      }
    }
  };

  // =========================
  // Cálculos
  // =========================
  const calcularSubtotal = (prod) => {
    const precioBase = prod.precio + (prod.precio * prod.subida) / 100;
    const precioConDescuento =
      precioBase - (precioBase * prod.descuento) / 100;
    return precioConDescuento * prod.cantidad;
  };

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + calcularSubtotal(p), 0),
    [productos]
  );

  // =========================
  // Finalizar compra
  // =========================
  const handleFinalizarCompra = () => {
    if (!proveedor) {
      setMensajeProveedor({
        tipo: "error",
        texto: "⚠️ Debe seleccionar un proveedor",
      });
      return;
    }
    if (productos.length === 0) {
      setMensajeProducto({
        tipo: "error",
        texto: "⚠️ Debe agregar al menos un producto",
      });
      return;
    }
    if (!comprobante) {
      alert("⚠️ Debe subir el comprobante original de la compra");
      return;
    }

    const nuevaCompra = {
      id: Date.now(),
      proveedor,
      productos,
      comprobante: { name: comprobante.name, type: comprobante.type },
      total,
      fecha: new Date().toLocaleString(),
      estado: "Completado",
    };

    const comprasGuardadas = JSON.parse(localStorage.getItem("compras")) || [];
    comprasGuardadas.push(nuevaCompra);
    localStorage.setItem("compras", JSON.stringify(comprasGuardadas));

    navigate("/app/purchases");
  };

  // =========================
  // Comprobante
  // =========================
  const handleComprobanteUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setComprobante(file);
  };

  // =========================
  // Errores de carga
  // =========================
  if (isSuppliersError) {
    const msg =
      suppliersError?.response?.data?.message ||
      suppliersError?.message ||
      "Error al cargar proveedores.";
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-center">{msg}</p>
      </div>
    );
  }

  if (isProductsError) {
    const msg =
      productsError?.response?.data?.message ||
      productsError?.message ||
      "Error al cargar productos.";
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-center">{msg}</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Registro de Compras</h2>
        <p className="text-sm text-gray-500 mt-1">
          Completa la información para registrar una nueva compra
        </p>
      </div>

      {/* Buscar proveedor */}
      <div className="mb-4 relative" ref={provWrapRef}>
        <label className="block text-sm text-gray-600 mb-1">
          Buscar Proveedor
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={proveedorQuery}
            onChange={(e) => {
              const val = e.target.value;
              setProveedorQuery(val);
              setIsProvOpen(true);

              if (!val.trim()) {
                setProveedor(null);
                setMensajeProveedor(null);
                setIsProvOpen(false);
                return;
              }

              const exacto = proveedoresDB.find((p) => p.nit === val.trim());
              if (exacto) seleccionarProveedor(exacto);
              else {
                setProveedor(null);
                setMensajeProveedor({
                  tipo: "error",
                  texto:
                    "❌ Proveedor no encontrado. Selecciónalo de la lista o créalo.",
                });
              }
            }}
            onFocus={() => {
              if (proveedorQuery.trim()) setIsProvOpen(true);
            }}
            onKeyDown={onProveedorKeyDown}
            placeholder={
              isSuppliersLoading ? "Cargando proveedores..." : "Ingrese NIT o nombre"
            }
            disabled={isSuppliersLoading}
            className="flex-1 border rounded px-3 py-2 bg-white text-black disabled:opacity-60"
          />

          {mensajeProveedor?.tipo === "error" && (
            <button
              onClick={() => setShowModalProveedor(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              type="button"
            >
              Registrar Proveedor
            </button>
          )}
        </div>

        {/* Dropdown proveedor */}
        {isProvOpen && proveedoresFiltrados.length > 0 && !proveedor && (
          <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow overflow-hidden">
            {proveedoresFiltrados.map((p, idx) => (
              <button
                key={p.id_proveedor ?? p.nit ?? idx}
                type="button"
                onMouseEnter={() => setProvActiveIndex(idx)}
                onClick={() => seleccionarProveedor(p)}
                className={`w-full text-left px-3 py-2 ${
                  idx === provActiveIndex ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
              >
                <span className="font-medium text-gray-900">{p.nombre}</span>{" "}
                <span className="text-gray-500 text-sm">({p.nit})</span>
              </button>
            ))}
          </div>
        )}

        {mensajeProveedor && (
          <p
            className={`mt-1 text-sm ${
              mensajeProveedor.tipo === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensajeProveedor.texto}
          </p>
        )}
      </div>

      {/* Buscar producto */}
      <div className="mb-4 relative" ref={prodWrapRef}>
        <label className="block text-sm text-gray-600 mb-1">
          Buscar Producto
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={productoQuery}
            onChange={(e) => {
              const val = e.target.value;
              setProductoQuery(val);
              setIsProdOpen(true);

              if (!val.trim()) {
                setMensajeProducto(null);
                setIsProdOpen(false);
                return;
              }

              const exacto = productosDB.find(
                (p) =>
                  normalizeText(p.codigo) === normalizeText(val) ||
                  normalizeText(p.nombre) === normalizeText(val)
              );

              if (exacto) agregarProducto(exacto);
              else {
                setMensajeProducto({
                  tipo: "error",
                  texto:
                    "❌ Producto no encontrado. Selecciónalo de la lista o créalo.",
                });
              }
            }}
            onFocus={() => {
              if (productoQuery.trim()) setIsProdOpen(true);
            }}
            onKeyDown={onProductoKeyDown}
            placeholder={
              isProductsLoading ? "Cargando productos..." : "Ingrese código o nombre"
            }
            disabled={isProductsLoading}
            className="flex-1 border rounded px-3 py-2 bg-white text-black disabled:opacity-60"
          />

          {mensajeProducto?.tipo === "error" && (
            <button
              onClick={() => setShowModalProducto(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              type="button"
            >
              Registrar Producto
            </button>
          )}
        </div>

        {/* Dropdown producto */}
        {isProdOpen && productosFiltrados.length > 0 && (
          <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow overflow-hidden">
            {productosFiltrados.map((p, idx) => (
              <button
                key={p.id_producto ?? p.codigo ?? idx}
                type="button"
                onMouseEnter={() => setProdActiveIndex(idx)}
                onClick={() => agregarProducto(p)}
                className={`w-full text-left px-3 py-2 flex justify-between ${
                  idx === prodActiveIndex ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
              >
                <div>
                  <span className="font-medium text-gray-900">{p.nombre}</span>{" "}
                  <span className="text-gray-500 text-sm">({p.codigo})</span>
                </div>
                <span className="text-gray-700 text-sm">${p.precio}</span>
              </button>
            ))}
          </div>
        )}

        {mensajeProducto && (
          <p
            className={`mt-1 text-sm ${
              mensajeProducto.tipo === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensajeProducto.texto}
          </p>
        )}
      </div>

      {/* Tabla productos */}
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Cantidad</th>
            <th className="border px-3 py-2">% Subida</th>
            <th className="border px-3 py-2">Descuento (%)</th>
            <th className="border px-3 py-2">Precio Compra</th>
            <th className="border px-3 py-2">Precio Venta</th>
            <th className="border px-3 py-2">Subtotal</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-gray-400 py-4">
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((prod, i) => (
              <tr key={prod.id_producto ?? prod.codigo ?? i}>
                <td className="border px-3 py-2 text-black">{prod.nombre}</td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].cantidad = parseInt(e.target.value) || 1;
                      nueva[i].subtotal = calcularSubtotal(nueva[i]);
                      setProductos(nueva);
                    }}
                    className="w-16 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={prod.subida}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].subida = parseFloat(e.target.value) || 0;
                      nueva[i].subtotal = calcularSubtotal(nueva[i]);
                      setProductos(nueva);
                    }}
                    className="w-20 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={prod.descuento}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].descuento = parseFloat(e.target.value) || 0;
                      nueva[i].subtotal = calcularSubtotal(nueva[i]);
                      setProductos(nueva);
                    }}
                    className="w-20 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${prod.precio}
                </td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={prod.precioVenta}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].precioVenta = parseFloat(e.target.value) || 0;
                      setProductos(nueva);
                    }}
                    className="w-20 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${calcularSubtotal(prod).toFixed(2)}
                </td>

                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() =>
                      setProductos(productos.filter((_, idx) => idx !== i))
                    }
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    type="button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Comprobante + total */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Subir comprobante original
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleComprobanteUpload}
          />
          {comprobante && (
            <p className="text-sm text-green-600 mt-1">
              Archivo cargado: {comprobante.name}
            </p>
          )}
        </div>

        <div className="text-right bg-gray-100 px-4 py-2 rounded shadow-md">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">
            ${total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={() => navigate("/app/purchases")}
          className="px-4 py-2 rounded bg-gray-500 text-white"
          type="button"
        >
          Cancelar
        </button>
        <button
          onClick={handleFinalizarCompra}
          className="px-4 py-2 rounded bg-green-600 text-white"
          type="button"
        >
          Finalizar Compra
        </button>
      </div>

      {/* Modales */}
      {showModalProducto && (
        <ProductRegisterModal onClose={() => setShowModalProducto(false)} />
      )}
      {showModalProveedor && (
        <SuplliersRegisterModal onClose={() => setShowModalProveedor(false)} />
      )}
    </div>
  );
}
