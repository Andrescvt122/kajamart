// DashboardVentas.jsx
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

// Registro ChartJS
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

// Colores
const LINE_DARK = "#2f6a3f";       // Verde oscuro para textos, títulos y líneas
const BAR_GREEN = "rgba(181,245,206,0.95)";   // Verde claro sólido para barras
const PIE_GREEN_1 = "rgba(181,245,206,0.95)"; // Verde para secciones de gráfico circular
const PIE_GREEN_2 = "rgba(181,245,206,0.8)";  // Verde semi-transparente
const PIE_GREEN_3 = "rgba(181,245,206,0.55)"; // Verde más claro / transparente
const BORDER_SUBTLE = "#6ea57a";    // Verde medio para bordes y detalles

// Hook contador
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

// Animaciones
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

// Componente principal
export default function DashboardVentas() {
  // Datos demo
  const ventasMensuales = [
    { mes: "Enero", valor: 12000 },
    { mes: "Febrero", valor: 15000 },
    { mes: "Marzo", valor: 11000 },
    { mes: "Abril", valor: 18000 },
    { mes: "Mayo", valor: 20000 },
  ];

  const topProductos = [
    { label: "Arroz Diana", valor: 5000 },
    { label: "Leche Colanta", valor: 4000 },
    { label: "Quesito Colanta", valor: 3500 },
    { label: "Aceite Diana", valor: 3000 },
    { label: "Arepas x5", valor: 2500 },
  ];

  const categorias = [
    { categoria: "Alimentos", valor: 14000 },
    { categoria: "Lácteos", valor: 8000 },
    { categoria: "Bebidas", valor: 6000 },
  ];

  const metricas = {
    totalVentas: 71000,
    ticketPromedio: 35000,
    clientesActivos: 132,
    crecimientoMensual: 12,
  };

  // Filtro global
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVentasMensuales = useMemo(() => {
    if (!searchTerm) return ventasMensuales;
    return ventasMensuales.filter(v =>
      v.mes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.valor.toString().includes(searchTerm)
    );
  }, [searchTerm, ventasMensuales]);

  const filteredTopProductos = useMemo(() => {
    if (!searchTerm) return topProductos;
    return topProductos.filter(p =>
      p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.valor.toString().includes(searchTerm)
    );
  }, [searchTerm, topProductos]);

  const filteredCategorias = useMemo(() => {
    if (!searchTerm) return categorias;
    return categorias.filter(c =>
      c.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.valor.toString().includes(searchTerm)
    );
  }, [searchTerm, categorias]);

  const filteredMetricas = useMemo(() => {
    if (!searchTerm) return metricas;
    const term = searchTerm.toLowerCase();
    return {
      totalVentas: metricas.totalVentas.toString().includes(term) ? metricas.totalVentas : 0,
      ticketPromedio: metricas.ticketPromedio.toString().includes(term) ? metricas.ticketPromedio : 0,
      clientesActivos: metricas.clientesActivos.toString().includes(term) ? metricas.clientesActivos : 0,
      crecimientoMensual: metricas.crecimientoMensual.toString().includes(term) ? metricas.crecimientoMensual : 0,
    };
  }, [searchTerm, metricas]);

  // Charts
  const ventasLineChart = useMemo(() => ({
    labels: filteredVentasMensuales.map(v => v.mes),
    datasets: [
      { type: "line", label: "Ventas", data: filteredVentasMensuales.map(v => v.valor), borderColor: LINE_DARK, backgroundColor: "rgba(181,245,206,0.1)", tension: 0.3 },
      { type: "bar", label: "Ventas Barras", data: filteredVentasMensuales.map(v => v.valor), backgroundColor: BAR_GREEN },
    ],
  }), [filteredVentasMensuales]);

  const topProductosChart = useMemo(() => ({
    labels: filteredTopProductos.map(p => p.label),
    datasets: [
      { label: "Ventas", data: filteredTopProductos.map(p => p.valor), backgroundColor: BAR_GREEN, borderColor: BORDER_SUBTLE, borderRadius: 12 },
    ],
  }), [filteredTopProductos]);

  const categoriasPie = useMemo(() => ({
    labels: filteredCategorias.map(c => c.categoria),
    datasets: [
      { data: filteredCategorias.map(c => c.valor), backgroundColor: [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3] },
    ],
  }), [filteredCategorias]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: LINE_DARK } },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
  };

  // Contadores
  const ventasCount = useCountUp(filteredMetricas.totalVentas);
  const ticketCount = useCountUp(filteredMetricas.ticketPromedio);
  const clientesCount = useCountUp(filteredMetricas.clientesActivos);
  const crecimientoCount = useCountUp(filteredMetricas.crecimientoMensual);

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
          {/* HEADER */}
          <motion.header variants={childFadeUp}>
            <h1 className="text-3xl font-extrabold text-black">Dashboard Ventas</h1>
            <p className="text-sm mt-2" style={{ color: LINE_DARK }}>Resumen general de las ventas</p>
          </motion.header>

          {/* FILTRO GLOBAL */}
          <motion.div variants={childFadeUp} className="mb-6 flex justify-end">
            <input
              type="text"
              placeholder="Buscar en todo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 w-full sm:w-64"
            />
          </motion.div>

          {/* METRICAS */}
          <motion.div variants={childFadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <AnimatedCard title="Total Ventas" value={`$${ventasCount.toLocaleString()}`} />
            <AnimatedCard title="Ticket Promedio" value={`$${ticketCount}`} />
            <AnimatedCard title="Clientes Activos" value={clientesCount} />
            <AnimatedCard title="Crecimiento (%)" value={`${crecimientoCount}%`} />
          </motion.div>

          {/* GRAFICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Evolución Mensual</h3>
              <div style={{ height: 240 }}>
                <Line data={ventasLineChart} options={commonOptions} />
              </div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Top Productos</h3>
              <div style={{ height: 240 }}>
                <Bar data={topProductosChart} options={{ ...commonOptions, indexAxis: "y" }} />
              </div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Ventas por Categoría</h3>
              <div style={{ height: 240 }}>
                <Pie data={categoriasPie} options={commonOptions} />
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Componente auxiliar
function AnimatedCard({ title, value }) {
  return (
    <motion.div
      variants={childFadeUp}
      whileHover={{ scale: 1.03, y: -6 }}
      className="p-4 rounded-xl flex flex-col justify-center min-h-[88px] bg-white shadow"
    >
      <p className="text-sm" style={{ color: LINE_DARK }}>{title}</p>
      <h2 className="font-bold text-2xl text-black">{value}</h2>
    </motion.div>
  );
}
