// IndexRegisterPurchase.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductRegisterModal from "../products/productRegisterModal";
import SuplliersRegisterModal from "../suppliers/SuplliersRegisterModal";

export default function IndexRegisterPurchase() {
  const navigate = useNavigate();

  // Estados
  const [proveedor, setProveedor] = useState(null);
  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [productos, setProductos] = useState([]);
  const [mensajeProveedor, setMensajeProveedor] = useState(null);
  const [mensajeProducto, setMensajeProducto] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [showModalProveedor, setShowModalProveedor] = useState(false);

  // Simulación BD
  const proveedoresDB = [
    { nit: "900123456", nombre: "Proveedor A" },
    { nit: "800987654", nombre: "Proveedor B" },
    { nit: "901654321", nombre: "Proveedor C" },
  ];

  const productosDB = [
    { codigo: "P001", nombre: "Producto 1", precio: 10 },
    { codigo: "P002", nombre: "Producto 2", precio: 20 },
    { codigo: "P003", nombre: "Producto 3", precio: 30 },
  ];

  // Buscar proveedor (tiempo real)
  const handleProveedorChange = (valor) => {
    setCodigoProveedor(valor);

    if (!valor.trim()) {
      setProveedor(null);
      setMensajeProveedor(null);
      return;
    }

    const provEncontrado = proveedoresDB.find((p) => p.nit === valor.trim());

    if (provEncontrado) {
      setProveedor(provEncontrado);
      setMensajeProveedor({
        tipo: "ok",
        texto: `✅ Proveedor encontrado: ${provEncontrado.nombre}`,
      });
    } else {
      setProveedor(null);
      setMensajeProveedor({
        tipo: "error",
        texto: "❌ Proveedor no encontrado. Puedes crearlo.",
      });
    }
  };

  // Buscar producto (tiempo real)
  const handleProductoChange = (valor) => {
    setCodigoProducto(valor);

    if (!valor.trim()) {
      setMensajeProducto(null);
      return;
    }

    const productoEncontrado = productosDB.find(
      (p) =>
        p.codigo.toLowerCase() === valor.toLowerCase() ||
        p.nombre.toLowerCase() === valor.toLowerCase()
    );

    if (productoEncontrado) {
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
        texto: `✅ Producto encontrado: ${productoEncontrado.nombre}`,
      });
    } else {
      setMensajeProducto({
        tipo: "error",
        texto: "❌ Producto no encontrado. Puedes crearlo.",
      });
    }
  };

  // Calcular subtotal
  const calcularSubtotal = (prod) => {
    const precioBase = prod.precio + (prod.precio * prod.subida) / 100;
    const precioConDescuento =
      precioBase - (precioBase * prod.descuento) / 100;
    return precioConDescuento * prod.cantidad;
  };

  // Finalizar compra
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
      comprobante,
      total: productos.reduce((acc, p) => acc + calcularSubtotal(p), 0),
      fecha: new Date().toLocaleString(),
      estado: "Completado",
    };

    const comprasGuardadas = JSON.parse(localStorage.getItem("compras")) || [];
    comprasGuardadas.push(nuevaCompra);
    localStorage.setItem("compras", JSON.stringify(comprasGuardadas));

    navigate("/app/purchases");
  };

  // Manejar carga de comprobante
  const handleComprobanteUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobante(file);
    }
  };

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
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Buscar Proveedor por NIT
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={codigoProveedor}
            onChange={(e) => handleProveedorChange(e.target.value)}
            placeholder="Ingrese el NIT del proveedor"
            className="flex-1 border rounded px-3 py-2 bg-white text-black"
          />
          {mensajeProveedor?.tipo === "error" && (
            <button
              onClick={() => setShowModalProveedor(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Registrar Proveedor
            </button>
          )}
        </div>
        {mensajeProveedor && (
          <p
            className={`mt-1 text-sm ${
              mensajeProveedor.tipo === "ok"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {mensajeProveedor.texto}
          </p>
        )}
      </div>

      {/* Buscar producto */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Buscar Producto
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={codigoProducto}
            onChange={(e) => handleProductoChange(e.target.value)}
            placeholder="Ingrese código o nombre del producto"
            className="flex-1 border rounded px-3 py-2 bg-white text-black"
          />
          {mensajeProducto?.tipo === "error" && (
            <button
              onClick={() => setShowModalProducto(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Registrar Producto
            </button>
          )}
        </div>
        {mensajeProducto && (
          <p
            className={`mt-1 text-sm ${
              mensajeProducto.tipo === "ok"
                ? "text-green-600"
                : "text-red-600"
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
              <tr key={i}>
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
                      nueva[i].descuento =
                        parseFloat(e.target.value) || 0;
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
                      nueva[i].precioVenta =
                        parseFloat(e.target.value) || 0;
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
                      setProductos(productos.filter((_, index) => index !== i))
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

      {/* Campo de comprobante y total */}
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
            $
            {productos
              .reduce((acc, p) => acc + calcularSubtotal(p), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={() => navigate("/app/purchases")}
          className="px-4 py-2 rounded bg-gray-500 text-white"
        >
          Cancelar
        </button>
        <button
          onClick={handleFinalizarCompra}
          className="px-4 py-2 rounded bg-green-600 text-white"
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
