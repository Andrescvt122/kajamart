// DashboardClientes.jsx
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

// Colores verdes
const LINE_DARK = "#2f6a3f";
const BAR_GREEN = "rgba(181,245,206,0.95)";
const PIE_GREEN_1 = "rgba(181,245,206,0.95)";
const PIE_GREEN_2 = "rgba(181,245,206,0.8)";
const PIE_GREEN_3 = "rgba(181,245,206,0.55)";
const BORDER_SUBTLE = "#6ea57a";

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
export default function DashboardClientes() {
  // Datos demo
  const clientesMensuales = [
    { mes: "Enero", valor: 40 },
    { mes: "Febrero", valor: 55 },
    { mes: "Marzo", valor: 35 },
    { mes: "Abril", valor: 60 },
    { mes: "Mayo", valor: 75 },
  ];

  const topClientes = [
    { label: "Cliente A", valor: 12000 },
    { label: "Cliente B", valor: 9500 },
    { label: "Cliente C", valor: 8000 },
    { label: "Cliente D", valor: 7000 },
    { label: "Cliente E", valor: 6000 },
  ];

  const tiposClientes = [
    { tipo: "Regular", valor: 50 },
    { tipo: "Premium", valor: 30 },
    { tipo: "VIP", valor: 20 },
  ];

  const metricas = {
    totalClientes: 100,
    clientesNuevos: 25,
    clientesActivos: 80,
    crecimientoMensual: 10,
  };

  // Filtro global
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClientesMensuales = useMemo(() => {
    if (!searchTerm) return clientesMensuales;
    return clientesMensuales.filter(v =>
      v.mes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.valor.toString().includes(searchTerm)
    );
  }, [searchTerm, clientesMensuales]);

  const filteredTopClientes = useMemo(() => {
    if (!searchTerm) return topClientes;
    return topClientes.filter(p =>
      p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.valor.toString().includes(searchTerm)
    );
  }, [searchTerm, topClientes]);

  const filteredTipos = useMemo(() => {
    if (!searchTerm) return tiposClientes;
    return tiposClientes.filter(c =>
      c.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.valor.toString().includes(searchTerm)
    );
  }, [searchTerm, tiposClientes]);

  const filteredMetricas = useMemo(() => {
    if (!searchTerm) return metricas;
    const term = searchTerm.toLowerCase();
    return {
      totalClientes: metricas.totalClientes.toString().includes(term) ? metricas.totalClientes : 0,
      clientesNuevos: metricas.clientesNuevos.toString().includes(term) ? metricas.clientesNuevos : 0,
      clientesActivos: metricas.clientesActivos.toString().includes(term) ? metricas.clientesActivos : 0,
      crecimientoMensual: metricas.crecimientoMensual.toString().includes(term) ? metricas.crecimientoMensual : 0,
    };
  }, [searchTerm, metricas]);

  // Charts
  const clientesLineChart = useMemo(() => ({
    labels: filteredClientesMensuales.map(v => v.mes),
    datasets: [
      { type: "line", label: "Clientes", data: filteredClientesMensuales.map(v => v.valor), borderColor: LINE_DARK, backgroundColor: "rgba(181,245,206,0.1)", tension: 0.3 },
      { type: "bar", label: "Clientes Barras", data: filteredClientesMensuales.map(v => v.valor), backgroundColor: BAR_GREEN },
    ],
  }), [filteredClientesMensuales]);

  const topClientesChart = useMemo(() => ({
    labels: filteredTopClientes.map(p => p.label),
    datasets: [
      { label: "Ventas", data: filteredTopClientes.map(p => p.valor), backgroundColor: BAR_GREEN, borderColor: BORDER_SUBTLE, borderRadius: 12 },
    ],
  }), [filteredTopClientes]);

  const tiposPie = useMemo(() => ({
    labels: filteredTipos.map(c => c.tipo),
    datasets: [
      { data: filteredTipos.map(c => c.valor), backgroundColor: [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3] },
    ],
  }), [filteredTipos]);

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
  const totalCount = useCountUp(filteredMetricas.totalClientes);
  const nuevosCount = useCountUp(filteredMetricas.clientesNuevos);
  const activosCount = useCountUp(filteredMetricas.clientesActivos);
  const crecimientoCount = useCountUp(filteredMetricas.crecimientoMensual);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-clientes"
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
            <h1 className="text-3xl font-extrabold text-black">Dashboard Clientes</h1>
            <p className="text-sm mt-2" style={{ color: LINE_DARK }}>Resumen general de los clientes</p>
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
            <AnimatedCard title="Total Clientes" value={totalCount} />
            <AnimatedCard title="Clientes Nuevos" value={nuevosCount} />
            <AnimatedCard title="Clientes Activos" value={activosCount} />
            <AnimatedCard title="Crecimiento (%)" value={`${crecimientoCount}%`} />
          </motion.div>

          {/* GRAFICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Evolución Mensual</h3>
              <div style={{ height: 240 }}>
                <Line data={clientesLineChart} options={commonOptions} />
              </div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Top Clientes</h3>
              <div style={{ height: 240 }}>
                <Bar data={topClientesChart} options={{ ...commonOptions, indexAxis: "y" }} />
              </div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl bg-white shadow">
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>Tipos de Clientes</h3>
              <div style={{ height: 240 }}>
                <Pie data={tiposPie} options={commonOptions} />
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
