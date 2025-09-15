import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IndexRegisterPurchase() {
  const navigate = useNavigate();

  const [proveedor, setProveedor] = useState(null); // Proveedor seleccionado
  const [codigoProveedor, setCodigoProveedor] = useState(""); // input de proveedor
  const [codigoProducto, setCodigoProducto] = useState(""); // input de producto
  const [productos, setProductos] = useState([]); // productos agregados
  const [mensaje, setMensaje] = useState(null); // mensajes de error/éxito
  const [metodoPago, setMetodoPago] = useState(""); // efectivo o transferencia

  // Simulación de proveedores en BD
  const proveedoresDB = [
    { codigo: "PR001", nombre: "Proveedor A" },
    { codigo: "PR002", nombre: "Proveedor B" },
    { codigo: "PR003", nombre: "Proveedor C" },
  ];

  // Simulación de productos en BD
  const productosDB = [
    { codigo: "P001", nombre: "Producto 1", precio: 10 },
    { codigo: "P002", nombre: "Producto 2", precio: 20 },
    { codigo: "P003", nombre: "Producto 3", precio: 30 },
  ];

  // Buscar proveedor automáticamente
  const handleSearchProveedor = () => {
    if (!codigoProveedor.trim()) return;

    const provEncontrado = proveedoresDB.find(
      (p) => p.codigo === codigoProveedor || p.nombre.toLowerCase() === codigoProveedor.toLowerCase()
    );

    if (!provEncontrado) {
      setMensaje({ tipo: "error", texto: "❌ Proveedor no encontrado" });
      setCodigoProveedor("");
      return;
    }

    setProveedor(provEncontrado);
    setMensaje({ tipo: "ok", texto: `✅ Proveedor seleccionado: ${provEncontrado.nombre}` });
    setCodigoProveedor("");
  };

  // Buscar producto automáticamente
  const handleSearchProducto = () => {
    if (!codigoProducto.trim()) return;

    const productoEncontrado = productosDB.find(
      (p) => p.codigo === codigoProducto || p.nombre.toLowerCase() === codigoProducto.toLowerCase()
    );

    if (!productoEncontrado) {
      setMensaje({ tipo: "error", texto: "❌ Producto no encontrado" });
      setCodigoProducto("");
      return;
    }

    const existe = productos.some((p) => p.codigo === productoEncontrado.codigo);
    if (existe) {
      setMensaje({ tipo: "error", texto: "⚠️ El producto ya está en la lista" });
      setCodigoProducto("");
      return;
    }

    setProductos((prev) => [
      ...prev,
      { ...productoEncontrado, cantidad: 1, estado: "Pendiente", subtotal: productoEncontrado.precio },
    ]);
    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setCodigoProducto("");
  };

  // Finalizar compra
  const handleFinalizarCompra = () => {
    if (!proveedor) {
      setMensaje({ tipo: "error", texto: "⚠️ Debe seleccionar un proveedor" });
      return;
    }
    if (productos.length === 0) {
      setMensaje({ tipo: "error", texto: "⚠️ Debe agregar al menos un producto" });
      return;
    }
    if (!metodoPago) {
      setMensaje({ tipo: "error", texto: "⚠️ Debe seleccionar un método de pago" });
      return;
    }

    const nuevaCompra = {
      id: Date.now(),
      proveedor,
      productos,
      metodoPago,
      total: productos.reduce((acc, p) => acc + p.subtotal, 0),
      fecha: new Date().toLocaleString(),
    };

    const comprasGuardadas = JSON.parse(localStorage.getItem("compras")) || [];
    comprasGuardadas.push(nuevaCompra);
    localStorage.setItem("compras", JSON.stringify(comprasGuardadas));

    navigate("/app/purchases"); // redirige al listado de compras
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

      {/* Botón volver */}
      <button
        onClick={() => navigate("/app/purchases")}
        className="px-4 py-2 w-fit rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 mb-6"
      >
        ← Volver al listado
      </button>

      {/* Buscar proveedor */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Buscar Proveedor</label>
        <input
          type="text"
          value={codigoProveedor}
          onChange={(e) => setCodigoProveedor(e.target.value)}
          onBlur={handleSearchProveedor}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchProveedor();
            }
          }}
          placeholder="Ingrese código o nombre del proveedor"
          className="w-full border rounded px-3 py-2 bg-white text-black"
        />
      </div>

      {/* Proveedor seleccionado */}
      {proveedor && (
        <p className="mb-4 text-green-700 font-semibold">
          ✅ Proveedor seleccionado: {proveedor.nombre}
        </p>
      )}

      {/* Buscar producto */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Buscar Producto</label>
        <input
          type="text"
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
          onBlur={handleSearchProducto}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchProducto();
            }
          }}
          placeholder="Ingrese código o nombre del producto"
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

      {/* Tabla de productos */}
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">Nombre</th>
            <th className="border border-gray-300 px-3 py-2">Cantidad</th>
            <th className="border border-gray-300 px-3 py-2">Precio</th>
            <th className="border border-gray-300 px-3 py-2">Estado</th>
            <th className="border border-gray-300 px-3 py-2">Subtotal</th>
            <th className="border border-gray-300 px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-gray-400 py-4">
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((prod, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-3 py-2 text-black">
                  {prod.nombre}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const nuevaCantidad = parseInt(e.target.value) || 1;
                      const nuevosProductos = [...productos];
                      nuevosProductos[i].cantidad = nuevaCantidad;
                      nuevosProductos[i].subtotal =
                        nuevaCantidad * nuevosProductos[i].precio;
                      setProductos(nuevosProductos);
                    }}
                    className="w-16 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.precio}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <select
                    value={prod.estado}
                    onChange={(e) => {
                      const nuevosProductos = [...productos];
                      nuevosProductos[i].estado = e.target.value;
                      setProductos(nuevosProductos);
                    }}
                    className="border rounded px-2 py-1 bg-white text-black"
                  >
                    <option>Pendiente</option>
                    <option>Completada</option>
                    <option>Anulada</option>
                  </select>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.subtotal}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <button
                    onClick={() => {
                      const nuevosProductos = productos.filter(
                        (_, index) => index !== i
                      );
                      setProductos(nuevosProductos);
                    }}
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

      {/* Método de pago */}
      <div className="mb-4">
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

      {/* Total y acciones */}
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">
          ${productos.reduce((acc, p) => acc + p.subtotal, 0).toLocaleString()}
        </p>
        <div className="flex space-x-2">
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
      </div>
    </div>
  );
}
