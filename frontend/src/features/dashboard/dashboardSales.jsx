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
import { motion, AnimatePresence } from "framer-motion";

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

const LINE_DARK = "#2f6a3f";
const BAR_GREEN = "rgba(181,245,206,0.95)";
const PIE_GREEN_1 = "rgba(181,245,206,0.95)";
const PIE_GREEN_2 = "rgba(181,245,206,0.8)";
const PIE_GREEN_3 = "rgba(181,245,206,0.55)";
const BORDER_SUBTLE = "#6ea57a";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SALES_URL = `${API_BASE}/kajamart/api/sales`;

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-CO", { month: "short" });
const money = (value) => Number(value || 0);

function useCountUp(value, duration = 1000) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (t) => {
      if (!start) start = t;
      const prog = Math.min((t - start) / duration, 1);
      setDisplay(Math.round(value * prog));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return display;
}

const containerVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -40, scale: 0.96, transition: { duration: 0.45 } },
};

const childFadeUp = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 12 } },
  exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.35 } },
};

const extractSales = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.sales)) return json.sales;
  if (Array.isArray(json?.ventas)) return json.ventas;
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

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
        const res = await fetch(SALES_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setSales(extractSales(json));
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
    const monthlyMap = new Map();
    const productMap = new Map();
    const categoryMap = new Map();
    const activeClients = new Set();

    const totalVentas = sales.reduce((sum, s) => {
      const fecha = new Date(s.fecha_venta);
      const monthKey = Number.isNaN(fecha.getTime()) ? "Sin fecha" : `${fecha.getFullYear()}-${fecha.getMonth()}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + money(s.total));

      if (s.id_cliente) activeClients.add(s.id_cliente);

      (s.detalle_venta || []).forEach((d) => {
        const productName = d?.detalle_productos?.productos?.nombre || "Sin producto";
        productMap.set(productName, (productMap.get(productName) || 0) + money(d.subtotal));

        const categoryId = d?.detalle_productos?.productos?.id_categoria;
        const categoryName = categoryId ? `Categoría ${categoryId}` : "Sin categoría";
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + money(d.subtotal));
      });

      return sum + money(s.total);
    }, 0);

    const monthlySorted = [...monthlyMap.entries()]
      .map(([key, valor]) => {
        const [year, month] = key.split("-");
        const date = key === "Sin fecha" ? null : new Date(Number(year), Number(month), 1);
        return {
          mes: date ? MONTH_FORMATTER.format(date) : "Sin fecha",
          valor,
          sort: date ? date.getTime() : 0,
        };
      })
      .sort((a, b) => a.sort - b.sort)
      .slice(-6);

    const topProductos = [...productMap.entries()]
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    const categorias = [...categoryMap.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 3);

    const prev = monthlySorted.at(-2)?.valor || 0;
    const current = monthlySorted.at(-1)?.valor || 0;
    const crecimientoMensual = prev > 0 ? ((current - prev) / prev) * 100 : 0;

    return {
      ventasMensuales: monthlySorted,
      topProductos,
      categorias,
      metricas: {
        totalVentas,
        ticketPromedio: sales.length ? totalVentas / sales.length : 0,
        clientesActivos: activeClients.size,
        crecimientoMensual,
      },
    };
  }, [sales]);

  const filteredVentasMensuales = useMemo(() => {
    if (!searchTerm) return computed.ventasMensuales;
    return computed.ventasMensuales.filter((v) => v.mes.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, computed.ventasMensuales]);

  const filteredTopProductos = useMemo(() => {
    if (!searchTerm) return computed.topProductos;
    return computed.topProductos.filter((p) => p.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, computed.topProductos]);

  const filteredCategorias = useMemo(() => {
    if (!searchTerm) return computed.categorias;
    return computed.categorias.filter((c) => c.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, computed.categorias]);

  const ventasLineChart = useMemo(() => ({
    labels: filteredVentasMensuales.map((v) => v.mes),
    datasets: [
      { type: "line", label: "Ventas", data: filteredVentasMensuales.map((v) => v.valor), borderColor: LINE_DARK, backgroundColor: "rgba(181,245,206,0.1)", tension: 0.3 },
      { type: "bar", label: "Ventas Barras", data: filteredVentasMensuales.map((v) => v.valor), backgroundColor: BAR_GREEN },
    ],
  }), [filteredVentasMensuales]);

  const topProductosChart = useMemo(() => ({
    labels: filteredTopProductos.map((p) => p.label),
    datasets: [
      { label: "Ventas", data: filteredTopProductos.map((p) => p.valor), backgroundColor: BAR_GREEN, borderColor: BORDER_SUBTLE, borderRadius: 12 },
    ],
  }), [filteredTopProductos]);

  const categoriasPie = useMemo(() => ({
    labels: filteredCategorias.map((c) => c.categoria),
    datasets: [
      { data: filteredCategorias.map((c) => c.valor), backgroundColor: [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3] },
    ],
  }), [filteredCategorias]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: LINE_DARK } },
      tooltip: { backgroundColor: "#fff", titleColor: "#000", bodyColor: "#000", borderColor: "#e5e7eb", borderWidth: 1 },
    },
  };

  const ventasCount = useCountUp(computed.metricas.totalVentas);
  const ticketCount = useCountUp(computed.metricas.ticketPromedio);
  const clientesCount = useCountUp(computed.metricas.clientesActivos);
  const crecimientoCount = useCountUp(computed.metricas.crecimientoMensual);

  return (
    <AnimatePresence mode="wait">
      <motion.div key="dashboard-ventas" className="p-8 bg-white min-h-screen" variants={containerVariants} initial="initial" animate="animate" exit="exit" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.header variants={childFadeUp}>
            <h1 className="text-3xl font-extrabold text-black">Dashboard Ventas</h1>
            <p className="text-sm mt-2" style={{ color: LINE_DARK }}>Resumen general de las ventas</p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </motion.header>

          <motion.div variants={childFadeUp} className="mb-6 flex justify-end">
            <input type="text" placeholder="Buscar en todo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 rounded-lg border border-gray-300 w-full sm:w-64" />
          </motion.div>

          <motion.div variants={childFadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <AnimatedCard title="Total Ventas" value={`$${ventasCount.toLocaleString()}`} />
            <AnimatedCard title="Ticket Promedio" value={`$${ticketCount.toLocaleString()}`} />
            <AnimatedCard title="Clientes Activos" value={clientesCount} />
            <AnimatedCard title="Crecimiento (%)" value={`${crecimientoCount}%`} />
          </motion.div>

          {loading ? <p className="text-sm text-gray-500">Cargando ventas...</p> : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Evolución Mensual</h3>
              <div style={{ height: 240 }}><Line data={ventasLineChart} options={commonOptions} /></div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Top Productos</h3>
              <div style={{ height: 240 }}><Bar data={topProductosChart} options={{ ...commonOptions, indexAxis: "y" }} /></div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Ventas por Categoría</h3>
              <div style={{ height: 240 }}><Pie data={categoriasPie} options={commonOptions} /></div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function AnimatedCard({ title, value }) {
  return (
    <motion.div variants={childFadeUp} whileHover={{ scale: 1.03, y: -6 }} className="p-4 rounded-xl flex flex-col justify-center min-h-[88px] bg-white shadow">
      <p className="text-sm" style={{ color: LINE_DARK }}>{title}</p>
      <h2 className="font-bold text-2xl text-black">{value}</h2>
    </motion.div>
  );
}
