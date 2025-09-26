import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IndexRegisterSale() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState("");
  const [codigo, setCodigo] = useState("");
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);

  // Cliente de caja quemado
  const clienteCaja = {
    id: "C000",
    nombre: "Cliente de Caja",
    documento: "N/A",
    telefono: "N/A",
  };

  // Simulación de productos en BD
  const productosDB = [
    { codigo: "P001", nombre: "Producto 1", precio: 10 },
    { codigo: "P002", nombre: "Producto 2", precio: 20 },
    { codigo: "P003", nombre: "Producto 3", precio: 30 },
  ];

  // Buscar producto automáticamente
  const handleSearchProduct = () => {
    if (!codigo.trim()) return;

    const productoEncontrado = productosDB.find((p) => p.codigo === codigo);

    if (!productoEncontrado) {
      setMensaje({ tipo: "error", texto: "❌ Producto no encontrado" });
      setCodigo("");
      return;
    }

    const existe = productos.some((p) => p.codigo === productoEncontrado.codigo);
    if (existe) {
      setMensaje({ tipo: "error", texto: "⚠️ El producto ya está en la lista" });
      setCodigo("");
      return;
    }

    setProductos([
      ...productos,
      {
        ...productoEncontrado,
        cantidad: 1,
        subtotal: productoEncontrado.precio,
      },
    ]);

    setMensaje({ tipo: "ok", texto: "✅ Producto agregado" });
    setCodigo("");
  };

  // Guardar la venta y redirigir
  const handleFinalizarVenta = () => {
    if (productos.length === 0) {
      setMensaje({ tipo: "error", texto: "⚠️ Debe agregar al menos un producto" });
      return;
    }

    if (!metodoPago) {
      setMensaje({ tipo: "error", texto: "⚠️ Seleccione un método de pago" });
      return;
    }

    // Si no hay cliente escrito -> usar cliente de caja
    const clienteFinal = cliente.trim()
      ? { id: Date.now(), nombre: cliente }
      : clienteCaja;

    const nuevaVenta = {
      id: Date.now(),
      cliente: clienteFinal.nombre,
      clienteId: clienteFinal.id,
      productos,
      metodoPago,
      total: productos.reduce((acc, p) => acc + p.subtotal, 0),
      fecha: new Date().toLocaleString(),
    };

    const ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
    ventasGuardadas.push(nuevaVenta);
    localStorage.setItem("ventas", JSON.stringify(ventasGuardadas));

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

      {/* Nombre del cliente */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Nombre del cliente (opcional)
        </label>
        <input
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Ingrese el nombre del cliente(Opcional)"
          className="w-full border rounded px-3 py-2 bg-white text-black"
        />
      </div>

      {/* Código de barras */}
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">
          Código de barras del producto
        </label>
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

      {/* Tabla de productos */}
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">Nombre</th>
            <th className="border border-gray-300 px-3 py-2">Cantidad</th>
            <th className="border border-gray-300 px-3 py-2">Precio Unitario</th>
            <th className="border border-gray-300 px-3 py-2">Subtotal</th>
            <th className="border border-gray-300 px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-gray-400 py-4">
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((prod, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-3 py-2 text-black">
                  {prod.nombre}
                </td>
                {/* Cantidad */}
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
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
                    className="w-16 border rounded px-2 py-1 text-center bg-white text-black no-spinner"
                  />
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.precio}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-black">
                  ${prod.subtotal}
                </td>
                {/* Eliminar */}
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
          $
          {productos.reduce((acc, p) => acc + p.subtotal, 0).toLocaleString()}
        </p>
        <div className="flex space-x-2">
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
      </div>
    </div>
  );
}
