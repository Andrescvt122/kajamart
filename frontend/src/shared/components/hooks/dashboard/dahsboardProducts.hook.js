// frontend/src/shared/components/hooks/dashboard/dahsboardProducts.hook.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";
const API_URL = `${API_BASE}/products`;

/**
 * Hook de dashboard de productos
 * - Consume GET /products (getAllProducts)
 * - Normaliza datos para el dashboard
 * - Expone:
 *   - topProducts: para el gráfico de barras (Top 5)
 *   - stockRisk: productos con stock bajo / agotado
 *   - metrics: métricas generales
 */
export const useDashboardProducts = () => {
  const {
    data: productsRaw = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", "products"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return Array.isArray(data) ? data : [];
    },
  });

  // 🔹 Normalización de productos
  const normalized = productsRaw.map((p) => {
    // categoria: viene del controller como "categoria" ya formateada
    const category =
      p.categoria ??
      p.categorias?.nombre_categoria ??
      (p.categorias && p.categorias.nombre_categoria) ??
      "Sin categoría";

    // proveedor principal: viene del controller como "proveedores" (array con objetos)
    let provider = "Sin proveedor";
    if (Array.isArray(p.proveedores) && p.proveedores.length > 0) {
      provider = p.proveedores[0]?.nombre ?? "Sin proveedor";
    } else if (Array.isArray(p.producto_proveedor) && p.producto_proveedor.length > 0) {
      provider =
        p.producto_proveedor[0]?.proveedores?.nombre ?? "Sin proveedor";
    }

    // fecha: usamos updated_at si existe, si no created_at
    const fechaRaw = p.updated_at ?? p.created_at ?? null;
    const date = fechaRaw ? new Date(fechaRaw) : null;

    const stockActual = Number(p.stock_actual ?? 0);
    const stockMinimo = Number(p.stock_minimo ?? 0);
    const costoUnitario = Number(p.costo_unitario ?? 0);

    // Valor de inventario por producto: costo_unitario * stock_actual
    const inventoryValue = costoUnitario * stockActual;

    return {
      id: p.id_producto,
      name: p.nombre ?? "Sin nombre",
      category,
      provider,
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
      stock_maximo: Number(p.stock_maximo ?? 0),
      costo_unitario: costoUnitario,
      precio_venta: Number(p.precio_venta ?? 0),
      inventoryValue,
      date,
    };
  });

  // 🔹 Top 5 productos por valor de inventario
  const topProducts = [...normalized]
    .sort((a, b) => b.inventoryValue - a.inventoryValue)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      label: p.name,
      value: p.inventoryValue,
      category: p.category,
      provider: p.provider,
      date: p.date,
    }));

  // 🔹 Productos en riesgo (stock bajo o agotado)
  const stockRisk = normalized
    .filter((p) => p.stock_actual <= p.stock_minimo || p.stock_actual === 0)
    .map((p) => ({
      id: p.id,
      label: p.name,
      stock: p.stock_actual,
      provider: p.provider,
      category: p.category,
      date: p.date,
    }));

  // 🔹 Métricas generales
  const metrics = {
    total: normalized.length,
    agotados: normalized.filter((p) => p.stock_actual === 0).length,
    valorInventario: normalized.reduce(
      (acc, p) => acc + (p.inventoryValue || 0),
      0
    ),
    // puedes cambiar esto si luego calculas rotación real
    rotacionPromedio: "–",
  };

  return {
    isLoading,
    isError,
    topProducts,
    stockRisk,
    metrics,
  };
};
