// frontend/src/shared/components/hooks/dashboard/dashboardSuppliers.hook.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";
const API_URL = `${API_BASE}/suppliers`;

/**
 * Hook para el Dashboard de Proveedores
 * - Consume GET /suppliers (debe traer compras y proveedor_categoria)
 * - Normaliza:
 *   - lastDelivery = última fecha_compra (Date)
 *   - totalPurchases = suma de total en compras (Number)
 *   - category = primera categoría del proveedor (si existe)
 */
export const useSuppliers = () =>
  useQuery({
    queryKey: ["suppliers", "dashboard"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      const arr = Array.isArray(data) ? data : [];

      const normalized = arr.map((s) => {
        // categorías: fuente puede ser s.proveedor_categoria[].categorias o s.categorias[]
        const cats =
          Array.isArray(s.proveedor_categoria)
            ? s.proveedor_categoria.map((pc) => pc.categorias)
            : Array.isArray(s.categorias)
            ? s.categorias
            : [];
        const firstCategory =
          cats && cats.length > 0
            ? (cats[0]?.nombre_categoria ?? "Sin categoría")
            : "Sin categoría";

        // compras: calcular última y total
        const compras = Array.isArray(s.compras) ? s.compras : [];
        let last = null;
        for (const c of compras) {
          if (!c?.fecha_compra) continue;
          const dt = new Date(c.fecha_compra);
          if (!last || dt > last) last = dt;
        }
        const totalPurchases = compras.reduce(
          (sum, c) => sum + Number(c?.total ?? 0),
          0
        );

        return {
          id: s.id_proveedor,
          nit: String(s.nit ?? ""),
          name: s.nombre ?? "Sin nombre",
          contact: s.contacto ?? "",
          phone: s.telefono ?? "",
          correo: s.correo ?? "",
          category: firstCategory,
          type: s.tipo_persona ?? "N/A", // p.ej. "Natural" / "Jurídica"
          estado: s.estado ? "Activo" : "Inactivo",
          lastDelivery: last, // Date | null
          totalPurchases,
          reliability: 1, // placeholder hasta que definas métrica real
        };
      });

      return normalized;
    },
  });
