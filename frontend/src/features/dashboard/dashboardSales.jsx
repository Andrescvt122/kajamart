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

const SALES_URL = `${API_BASE}/kajamart/api/sales`;

const extractSales = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.sales)) return json.sales;
  if (Array.isArray(json?.ventas)) return json.ventas;
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

export default function DashboardVentas() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError("");

      try {
        const salesData = await fetchAllPages(SALES_URL, {
          extractor: extractSales,
          extraParams: { limit: 100 },
        });
        setSales(salesData);
      } catch (err) {
        setError(err?.message || "Error cargando ventas");
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const computed = useMemo(() => {
    const validSales = sales.filter((sale) => sale?.estado_venta !== "Anulada");
    const monthlyMap = new Map();
    const productMap = new Map();
    const categoryMap = new Map();
    const activeClients = new Set();

    const totalVentas = validSales.reduce((sum, sale) => {
      const bucket = getMonthBucket(sale?.fecha_venta);
      if (bucket) {
        monthlyMap.set(bucket.key, {
          mes: bucket.label,
          valor: (monthlyMap.get(bucket.key)?.valor || 0) + money(sale?.total),
          sort: bucket.sort,
        });
      }

      const clientId = Number(sale?.id_cliente);
      if (Number.isFinite(clientId) && clientId > 0) {
        activeClients.add(clientId);
      }

      (sale?.detalle_venta || []).forEach((detail) => {
        const productName =
          detail?.detalle_productos?.productos?.nombre || "Sin producto";
        productMap.set(
          productName,
          (productMap.get(productName) || 0) + money(detail?.subtotal)
        );

        const categoryName = getCategoryLabel(
          detail?.detalle_productos?.productos
        );
        categoryMap.set(
          categoryName,
          (categoryMap.get(categoryName) || 0) + money(detail?.subtotal)
        );
      });

      return sum + money(sale?.total);
    }, 0);

    const ventasMensuales = sortMonthlyValues(monthlyMap);
    const previousMonth = ventasMensuales.at(-2)?.valor || 0;
    const currentMonth = ventasMensuales.at(-1)?.valor || 0;
    const crecimientoMensual =
      previousMonth > 0
        ? ((currentMonth - previousMonth) / previousMonth) * 100
        : 0;

    return {
      ventasMensuales,
      topProductos: [...productMap.entries()]
        .map(([label, valor]) => ({ label, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
      categorias: [...categoryMap.entries()]
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
      metricas: {
        totalVentas,
        ticketPromedio: validSales.length ? totalVentas / validSales.length : 0,
        clientesActivos: activeClients.size,
        crecimientoMensual,
      },
    };
  }, [sales]);

  const filteredVentasMensuales = useMemo(() => {
    if (!searchTerm) return computed.ventasMensuales;
    const term = searchTerm.toLowerCase();
    return computed.ventasMensuales.filter(
      (item) =>
        item.mes.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.ventasMensuales, searchTerm]);

  const filteredTopProductos = useMemo(() => {
    if (!searchTerm) return computed.topProductos;
    const term = searchTerm.toLowerCase();
    return computed.topProductos.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.topProductos, searchTerm]);

  const filteredCategorias = useMemo(() => {
    if (!searchTerm) return computed.categorias;
    const term = searchTerm.toLowerCase();
    return computed.categorias.filter(
      (item) =>
        item.categoria.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.categorias, searchTerm]);

  const ventasLineChart = useMemo(
    () => ({
      labels: filteredVentasMensuales.map((item) => item.mes),
      datasets: [
        {
          type: "line",
          label: "Ventas",
          data: filteredVentasMensuales.map((item) => item.valor),
          borderColor: LINE_DARK,
          backgroundColor: "rgba(181,245,206,0.1)",
          tension: 0.3,
        },
        {
          type: "bar",
          label: "Ventas Barras",
          data: filteredVentasMensuales.map((item) => item.valor),
          backgroundColor: BAR_GREEN,
        },
      ],
    }),
    [filteredVentasMensuales]
  );

  const topProductosChart = useMemo(
    () => ({
      labels: filteredTopProductos.map((item) => item.label),
      datasets: [
        {
          label: "Ventas",
          data: filteredTopProductos.map((item) => item.valor),
          backgroundColor: BAR_GREEN,
          borderColor: BORDER_SUBTLE,
          borderRadius: 12,
        },
      ],
    }),
    [filteredTopProductos]
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

  const ventasCount = useCountUp(computed.metricas.totalVentas);
  const ticketCount = useCountUp(computed.metricas.ticketPromedio);
  const clientesCount = useCountUp(computed.metricas.clientesActivos);
  const crecimientoCount = useCountUp(computed.metricas.crecimientoMensual);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-ventas"
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
              Dashboard Ventas
            </h1>
            <p className="text-sm mt-2" style={{ color: LINE_DARK }}>
              Resumen general de las ventas
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
              title="Total Ventas"
              value={formatCurrency(ventasCount)}
            />
            <AnimatedCard
              title="Ticket Promedio"
              value={formatCurrency(ticketCount)}
            />
            <AnimatedCard title="Clientes Activos" value={clientesCount} />
            <AnimatedCard
              title="Crecimiento (%)"
              value={`${crecimientoCount}%`}
            />
          </motion.div>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando ventas...</p>
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
                <Line data={ventasLineChart} options={commonChartOptions} />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: LINE_DARK }}>
                  Top Productos
                </h3>
                <span className="text-sm text-gray-500">
                  {computed.topProductos[0]
                    ? formatCurrency(computed.topProductos[0].valor)
                    : "Sin ventas"}
                </span>
              </div>
              <div style={{ height: 240 }}>
                <Bar
                  data={topProductosChart}
                  options={{ ...commonChartOptions, indexAxis: "y" }}
                />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow lg:col-span-2"
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Ventas por Categoria
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
