import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IndexRegisterPurchase() {
  const navigate = useNavigate();

  // Estados
  const [proveedor, setProveedor] = useState(null);
  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");

  // Simulación de BD
  const proveedoresDB = [
    { codigo: "PR001", nombre: "Proveedor A" },
    { codigo: "PR002", nombre: "Proveedor B" },
    { codigo: "PR003", nombre: "Proveedor C" },
  ];

  const productosDB = [
    { codigo: "P001", nombre: "Producto 1", precio: 10 },
    { codigo: "P002", nombre: "Producto 2", precio: 20 },
    { codigo: "P003", nombre: "Producto 3", precio: 30 },
  ];

  // Funciones
  const handleSearchProveedor = () => {
    if (!codigoProveedor.trim()) return;

    const provEncontrado = proveedoresDB.find(
      (p) =>
        p.codigo === codigoProveedor ||
        p.nombre.toLowerCase() === codigoProveedor.toLowerCase()
    );

    if (!provEncontrado) {
      setMensaje({ tipo: "error", texto: "❌ Proveedor no encontrado" });
      setCodigoProveedor("");
      return;
    }

    setProveedor(provEncontrado);
    setMensaje({
      tipo: "ok",
      texto: `✅ Proveedor seleccionado: ${provEncontrado.nombre}`,
    });
    setCodigoProveedor("");
  };

  const handleSearchProducto = () => {
    if (!codigoProducto.trim()) return;

    const productoEncontrado = productosDB.find(
      (p) =>
        p.codigo === codigoProducto ||
        p.nombre.toLowerCase() === codigoProducto.toLowerCase()
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
      { ...productoEncontrado, cantidad: 1, subtotal: productoEncontrado.precio },
    ]);
    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setCodigoProducto("");
  };

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

    navigate("/app/purchases");
  };

  // Render
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
        <label className="block text-sm text-gray-600 mb-1">Buscar Proveedor</label>
        <input
          type="text"
          value={codigoProveedor}
          onChange={(e) => setCodigoProveedor(e.target.value)}
          onBlur={handleSearchProveedor}
          onKeyDown={(e) => e.key === "Enter" && handleSearchProveedor()}
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
          onKeyDown={(e) => e.key === "Enter" && handleSearchProducto()}
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
            <th className="border border-gray-300 px-3 py-2">Precio Compra</th>
            <th className="border border-gray-300 px-3 py-2">Precio Venta</th>
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
                <td className="border border-gray-300 px-3 py-2 text-black">{prod.nombre}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const nuevaCantidad = parseInt(e.target.value) || 1;
                      const nuevosProductos = [...productos];
                      nuevosProductos[i].cantidad = nuevaCantidad;
                      nuevosProductos[i].subtotal = nuevaCantidad * nuevosProductos[i].precio;
                      setProductos(nuevosProductos);
                    }}
                    className="w-16 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.precio} {/* Precio de compra */}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.precioVenta || prod.precio} {/* Precio de venta, si no existe usar el mismo */}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.subtotal}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <button
                    onClick={() => setProductos(productos.filter((_, index) => index !== i))}
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
          {/* Método de pago */}
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

          {/* Total a pagar */}
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
  );
}
