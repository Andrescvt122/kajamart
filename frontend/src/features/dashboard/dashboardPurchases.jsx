import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  API_BASE,
  BAR_GREEN,
  BORDER_SUBTLE,
  LINE_DARK,
  PIE_GREEN_1,
  PIE_GREEN_2,
  PIE_GREEN_3,
  childFadeUp,
  commonChartOptions,
  containerVariants,
  fetchAllPages,
  formatCurrency,
  getCategoryLabel,
  getMonthBucket,
  money,
  sortMonthlyValues,
  useCountUp,
} from "./dashboardShared";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const PURCHASES_URL = `${API_BASE}/kajamart/api/purchase`;

const extractPurchases = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.purchase)) return json.purchase;
  if (Array.isArray(json?.purchases)) return json.purchases;
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

function AnimatedCard({ title, value }) {
  return (
    <div className="p-4 rounded-xl flex flex-col justify-center min-h-[88px] bg-white shadow">
      <p className="text-sm" style={{ color: LINE_DARK }}>
        {title}
      </p>
      <h2 className="font-bold text-2xl text-black">{value}</h2>
    </div>
  );
}

export default function DashboardCompras() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      setError("");

      try {
        const purchasesData = await fetchAllPages(PURCHASES_URL, {
          extractor: extractPurchases,
        });
        setPurchases(purchasesData);
      } catch (err) {
        setError(err?.message || "Error cargando compras");
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const computed = useMemo(() => {
    const validPurchases = purchases.filter(
      (purchase) => purchase?.estado_compra !== "Anulada"
    );
    const monthlyMap = new Map();
    const providerMap = new Map();
    const categoryMap = new Map();
    const activeProviders = new Set();

    const totalCompras = validPurchases.reduce((sum, purchase) => {
      const bucket = getMonthBucket(
        purchase?.created_at || purchase?.fecha_compra
      );

      if (bucket) {
        monthlyMap.set(bucket.key, {
          mes: bucket.label,
          valor:
            (monthlyMap.get(bucket.key)?.valor || 0) + money(purchase?.total),
          sort: bucket.sort,
        });
      }

      const providerId = Number(purchase?.id_proveedor);
      const providerName =
        purchase?.proveedores?.nombre ||
        (Number.isFinite(providerId) ? `Proveedor ${providerId}` : "Sin proveedor");

      if (Number.isFinite(providerId) && providerId > 0) {
        activeProviders.add(providerId);
      }

      providerMap.set(
        providerName,
        (providerMap.get(providerName) || 0) + money(purchase?.total)
      );

      (purchase?.detalle_compra || []).forEach((detail) => {
        const categoryName = getCategoryLabel(detail?.detalle_productos?.productos);
        categoryMap.set(
          categoryName,
          (categoryMap.get(categoryName) || 0) + money(detail?.subtotal)
        );
      });

      return sum + money(purchase?.total);
    }, 0);

    const comprasMensuales = sortMonthlyValues(monthlyMap);
    const previousMonth = comprasMensuales.at(-2)?.valor || 0;
    const currentMonth = comprasMensuales.at(-1)?.valor || 0;
    const crecimientoMensual =
      previousMonth > 0
        ? ((currentMonth - previousMonth) / previousMonth) * 100
        : 0;

    return {
      comprasMensuales,
      topProveedores: [...providerMap.entries()]
        .map(([label, valor]) => ({ label, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
      categoriasCompras: [...categoryMap.entries()]
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
      metricas: {
        totalCompras,
        gastoPromedio: validPurchases.length
          ? totalCompras / validPurchases.length
          : 0,
        proveedoresActivos: activeProviders.size,
        crecimientoMensual,
      },
    };
  }, [purchases]);

  const filteredComprasMensuales = useMemo(() => {
    if (!searchTerm) return computed.comprasMensuales;
    const term = searchTerm.toLowerCase();
    return computed.comprasMensuales.filter(
      (item) =>
        item.mes.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.comprasMensuales, searchTerm]);

  const filteredTopProveedores = useMemo(() => {
    if (!searchTerm) return computed.topProveedores;
    const term = searchTerm.toLowerCase();
    return computed.topProveedores.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.topProveedores, searchTerm]);

  const filteredCategorias = useMemo(() => {
    if (!searchTerm) return computed.categoriasCompras;
    const term = searchTerm.toLowerCase();
    return computed.categoriasCompras.filter(
      (item) =>
        item.categoria.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.categoriasCompras, searchTerm]);

  const comprasLineChart = useMemo(
    () => ({
      labels: filteredComprasMensuales.map((item) => item.mes),
      datasets: [
        {
          type: "line",
          label: "Compras",
          data: filteredComprasMensuales.map((item) => item.valor),
          borderColor: LINE_DARK,
          backgroundColor: "rgba(181,245,206,0.1)",
          tension: 0.3,
        },
        {
          type: "bar",
          label: "Compras Barras",
          data: filteredComprasMensuales.map((item) => item.valor),
          backgroundColor: BAR_GREEN,
        },
      ],
    }),
    [filteredComprasMensuales]
  );

  const topProveedoresChart = useMemo(
    () => ({
      labels: filteredTopProveedores.map((item) => item.label),
      datasets: [
        {
          label: "Compras",
          data: filteredTopProveedores.map((item) => item.valor),
          backgroundColor: BAR_GREEN,
          borderColor: BORDER_SUBTLE,
          borderRadius: 12,
        },
      ],
    }),
    [filteredTopProveedores]
  );

  const categoriasPie = useMemo(
    () => ({
      labels: filteredCategorias.map((item) => item.categoria),
      datasets: [
        {
          data: filteredCategorias.map((item) => item.valor),
          backgroundColor: [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3],
        },
      ],
    }),
    [filteredCategorias]
  );

  const comprasCount = useCountUp(computed.metricas.totalCompras);
  const gastoCount = useCountUp(computed.metricas.gastoPromedio);
  const proveedoresCount = useCountUp(computed.metricas.proveedoresActivos);
  const crecimientoCount = useCountUp(computed.metricas.crecimientoMensual);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-compras"
        className="p-8 bg-white min-h-screen"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.header variants={childFadeUp}>
            <h1 className="text-3xl font-extrabold text-black">
              Dashboard Compras
            </h1>
            <p className="text-sm mt-2" style={{ color: LINE_DARK }}>
              Resumen general de las compras
            </p>
            {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
          </motion.header>

          <motion.div variants={childFadeUp} className="mb-6 flex justify-end">
            <input
              type="text"
              placeholder="Buscar en todo..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="p-2 rounded-lg border border-gray-300 w-full sm:w-64"
            />
          </motion.div>

          <motion.div
            variants={childFadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <AnimatedCard
              title="Total Compras"
              value={formatCurrency(comprasCount)}
            />
            <AnimatedCard
              title="Gasto Promedio"
              value={formatCurrency(gastoCount)}
            />
            <AnimatedCard
              title="Proveedores Activos"
              value={proveedoresCount}
            />
            <AnimatedCard
              title="Crecimiento (%)"
              value={`${crecimientoCount}%`}
            />
          </motion.div>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando compras...</p>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow"
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Evolucion Mensual
              </h3>
              <div style={{ height: 240 }}>
                <Line data={comprasLineChart} options={commonChartOptions} />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: LINE_DARK }}>
                  Top Proveedores
                </h3>
                <span className="text-sm text-gray-500">
                  {computed.topProveedores[0]
                    ? formatCurrency(computed.topProveedores[0].valor)
                    : "Sin compras"}
                </span>
              </div>
              <div style={{ height: 240 }}>
                <Bar
                  data={topProveedoresChart}
                  options={{ ...commonChartOptions, indexAxis: "y" }}
                />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow lg:col-span-2"
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Compras por Categoria
              </h3>
              <div style={{ height: 240 }}>
                <Pie data={categoriasPie} options={commonChartOptions} />
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
