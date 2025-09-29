// DashboardProducts_final.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
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
import { Calendar } from "primereact/calendar";
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

/* --- ANIMATIONS (potentes) --- */
const containerVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: -40, scale: 0.96, transition: { duration: 0.45 } },
};

const childFadeUp = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 12 } },
  exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.35 } },
};

const rowVariants = {
  initial: { opacity: 0, x: -60, rotate: -6, scale: 0.98 },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12, delay: i * 0.03 },
  }),
  exit: { opacity: 0, x: 60, rotate: 6, transition: { duration: 0.35 } },
};

const hoverPower = { scale: 1.02, rotate: -0.8, transition: { type: "spring", stiffness: 220, damping: 12 } };

/* --- COMPONENTE PRINCIPAL --- */
export default function DashboardProducts() {
  // datos demo
  const rawTopProducts = [
    { label: "Arroz Diana", value: 5000, date: "2025-09-20", category: "Alimentos", provider: "Diana" },
    { label: "Leche Colanta", value: 4000, date: "2025-09-22", category: "Lácteos", provider: "Colanta" },
    { label: "Quesito Colanta", value: 3500, date: "2025-09-23", category: "Lácteos", provider: "Colanta" },
    { label: "Aceite Diana", value: 3000, date: "2025-09-18", category: "Alimentos", provider: "Diana" },
    { label: "Arepas Blancas x5", value: 2500, date: "2025-09-21", category: "Alimentos", provider: "Local" },
  ];

  const rawStock = [
    { name: "Leche Colanta", stock: 3, date: "2025-09-22", category: "Lácteos", provider: "Colanta" },
    { name: "Aceite Diana", stock: 0, date: "2025-09-18", category: "Alimentos", provider: "Diana" },
    { name: "Quesito Colanta", stock: 2, date: "2025-09-23", category: "Lácteos", provider: "Colanta" },
    { name: "Arepas Blancas x5", stock: 0, date: "2025-09-21", category: "Alimentos", provider: "Local" },
  ];

  const metricas = {
    total: rawTopProducts.length,
    agotados: rawStock.filter((p) => p.stock === 0).length,
    valorInventario: rawTopProducts.reduce((s, p) => s + p.value, 0),
    rotacionPromedio: "2.5x",
  };

  // filtros
  const [dateRange, setDateRange] = useState(null);
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [applied, setApplied] = useState(false); // para dar feedback

  const clearFilters = () => {
    setDateRange(null);
    setCategoria("");
    setProveedor("");
    setApplied(false);
  };

  const applyFilters = () => {
    setApplied(true);
    // efecto visual por 1.2s (puedes expandir lógica real)
    setTimeout(() => setApplied(false), 1200);
  };

  const filterBy = (itemDate) => {
    if (!dateRange || dateRange.length !== 2) return true;
    const [s, e] = dateRange;
    if (!s || !e) return true;
    const d = new Date(itemDate);
    const sd = new Date(s); sd.setHours(0, 0, 0, 0);
    const ed = new Date(e); ed.setHours(23, 59, 59, 999);
    return d >= sd && d <= ed;
  };

  const filteredTop = rawTopProducts
    .filter((p) => (categoria ? p.category.toLowerCase().includes(categoria.toLowerCase()) : true))
    .filter((p) => (proveedor ? p.provider.toLowerCase().includes(proveedor.toLowerCase()) : true))
    .filter((p) => filterBy(p.date));

  const filteredStock = rawStock
    .filter((p) => (categoria ? p.category.toLowerCase().includes(categoria.toLowerCase()) : true))
    .filter((p) => (proveedor ? p.provider.toLowerCase().includes(proveedor.toLowerCase()) : true))
    .filter((p) => filterBy(p.date));

  // charts
  const topProductosChart = useMemo(() => ({
    labels: filteredTop.map((p) => p.label),
    datasets: [
      {
        label: "Ventas",
        data: filteredTop.map((p) => p.value),
        backgroundColor: BAR_GREEN,
        borderColor: BORDER_SUBTLE,
        borderRadius: 12,
        barThickness: 18,
      },
    ],
  }), [filteredTop]);

  const stockDistribucionChart = useMemo(() => ({
    labels: ["En Stock", "Stock Bajo", "Agotado"],
    datasets: [
      {
        data: [
          filteredStock.filter((s) => s.stock > 5).length,
          filteredStock.filter((s) => s.stock > 0 && s.stock <= 5).length,
          filteredStock.filter((s) => s.stock === 0).length,
        ],
        backgroundColor: [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3],
        hoverOffset: 8,
      },
    ],
  }), [filteredStock]);

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#072a16",
        bodyColor: "#072a16",
        borderColor: "#e7f3ea",
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: LINE_DARK } },
      y: { grid: { display: false }, ticks: { color: LINE_DARK } },
    },
  }), []);

  // contadores
  const totalCount = useCountUp(metricas.total);
  const agotadosCount = useCountUp(metricas.agotados);
  const valorCount = useCountUp(metricas.valorInventario);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-products"
        className="p-8 bg-white min-h-screen"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER */}
          <motion.header variants={childFadeUp} style={{ originY: 0 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="text-3xl font-extrabold text-black"
            >
              Gestión de Productos
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-sm mt-2"
              style={{ color: LINE_DARK }}
            >Generalidades de los productos 
            </motion.p>
          </motion.header>

          {/* FILTROS (mejorados) */}
          <motion.section variants={childFadeUp} className="p-6 rounded-xl" style={{ background: "#fff", boxShadow: "0 12px 40px rgba(15,92,46,0.06)" }}>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
              <div className="flex-1">
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>Categoría</label>
                <motion.div whileHover={hoverPower} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "transparent", boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke={LINE_DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <input
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Buscar categoría..."
                    className="w-full bg-transparent focus:outline-none"
                    style={{ color: "#000" }}
                  />
                  {categoria && (
                    <motion.button
                      onClick={() => setCategoria("")}
                      whileTap={{ scale: 0.92 }}
                      aria-label="clear"
                      style={{ padding: 6, borderRadius: 10, background: "transparent" }}
                    >
                      ✕
                    </motion.button>
                  )}
                </motion.div>
              </div>

              <div className="flex-1">
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>Proveedor</label>
                <motion.div whileHover={hoverPower} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "transparent", boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke={LINE_DARK} strokeWidth="1.6"/></svg>
                  <input
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    placeholder="Buscar proveedor..."
                    className="w-full bg-transparent focus:outline-none"
                    style={{ color: "#000" }}
                  />
                  {proveedor && (
                    <motion.button
                      onClick={() => setProveedor("")}
                      whileTap={{ scale: 0.92 }}
                      aria-label="clear"
                      style={{ padding: 6, borderRadius: 10, background: "transparent" }}
                    >
                      ✕
                    </motion.button>
                  )}
                </motion.div>
              </div>

              <div style={{ minWidth: 220 }}>
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>Rango de fechas</label>
                <motion.div whileHover={hoverPower} className="rounded-xl overflow-hidden p-1" style={{ background: "transparent", boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)" }}>
                  <Calendar
                    value={dateRange}
                    onChange={(e) => setDateRange(e.value)}
                    selectionMode="range"
                    dateFormat="yy-mm-dd"
                    placeholder="Rango de fechas"
                    showIcon
                    className="w-full p-1"
                  />
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              
              <motion.button
                onClick={clearFilters}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                className="px-5 py-2 rounded-full font-semibold"
                style={{ background: BAR_GREEN, color: "#000", boxShadow: "0 12px 40px rgba(15,92,46,0.06)" }}
              >
                Limpiar
              </motion.button>

              <div className="ml-auto flex items-center gap-2">
                <motion.div
                  animate={applied ? { scale: [1, 1.06, 1], rotate: [0, -2, 0] } : { scale: 1 }}
                  transition={{ duration: 0.9 }}
                  className="text-sm"
                  style={{ color: LINE_DARK }}
                >
                  {filteredTop.length} productos · {filteredStock.length} en riesgo
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke={LINE_DARK} strokeWidth="1.6" strokeLinecap="round"/></svg>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* METRICAS */}
          <motion.div variants={childFadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <AnimatedCard title="Productos" value={totalCount} />
            <AnimatedCard title="Agotados" value={agotadosCount} />
            <AnimatedCard title="Valor Inventario" value={`$${valorCount.toLocaleString()}`} small />
            <AnimatedCard title="Rotación" value={metricas.rotacionPromedio} small />
          </motion.div>

          {/* GRAFICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section variants={childFadeUp} className="p-6 rounded-xl" style={{ background: "#fff", boxShadow: "0 12px 40px rgba(15,92,46,0.06)" }}>
              <motion.h3 initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.03 }} className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Top 5 Productos
              </motion.h3>
              <div style={{ height: 240 }}>
                <Bar data={topProductosChart} options={{ ...commonOptions, indexAxis: "y", animation: { duration: 700 } }} />
              </div>
            </motion.section>

            <motion.section variants={childFadeUp} className="p-6 rounded-xl" style={{ background: "#fff", boxShadow: "0 12px 40px rgba(15,92,46,0.06)" }}>
              <motion.h3 initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Distribución del Stock
              </motion.h3>
              <div style={{ height: 240 }}>
                <Pie data={stockDistribucionChart} options={{ maintainAspectRatio: false }} />
              </div>
            </motion.section>
          </div>

          {/* TABLA - animada y mejorada */}
          <motion.section variants={childFadeUp} className="p-6 rounded-xl" style={{ background: "#fff", boxShadow: "0 12px 40px rgba(15,92,46,0.06)" }}>
            <motion.h3 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-semibold mb-3" style={{ color: LINE_DARK }}>
              Productos en Riesgo
            </motion.h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto" style={{ borderCollapse: "separate" }}>
                <thead>
                  <tr>
                    <th className="p-3 text-sm" style={{ color: LINE_DARK }}>Producto</th>
                    <th className="p-3 text-sm" style={{ color: LINE_DARK }}>Stock</th>
                    <th className="p-3 text-sm" style={{ color: LINE_DARK }}>Proveedor</th>
                    <th className="p-3 text-sm" style={{ color: LINE_DARK }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredStock.map((p, i) => {
                      const isOut = p.stock === 0;
                      return (
                        <motion.tr
                          key={p.name + p.date}
                          custom={i}
                          variants={rowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          whileHover={{ scale: 1.01, boxShadow: "0 12px 40px rgba(15,92,46,0.06)" }}
                          layout
                        >
                          <td className="p-3" style={{ color: "#000", fontWeight: 600 }}>{p.name}</td>
                          <td className="p-3">
                            <motion.span
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.05 + i * 0.02, type: "spring", stiffness: 200 }}
                              className="px-3 py-1 rounded-full text-sm inline-block"
                              style={{
                                background: isOut ? "linear-gradient(90deg,#ffe9e9,#ffd4d4)" : "linear-gradient(90deg,#e8f9ea,#ccf6d9)",
                                color: isOut ? "#7f1d1d" : "#0f5132",
                                fontWeight: 700,
                              }}
                            >
                              {isOut ? "Agotado" : `Bajo (${p.stock})`}
                            </motion.span>
                          </td>
                          <td className="p-3" style={{ color: "#000" }}>{p.provider}</td>
                          <td className="p-3" style={{ color: "#000" }}>{p.date}</td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {filteredStock.length === 0 && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={4} className="p-6 text-center" style={{ color: LINE_DARK }}>
                        No hay productos en riesgo para los filtros seleccionados.
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* --- COMPONENTES AUX --- */
function AnimatedCard({ title, value, small = false }) {
  return (
    <motion.div
      variants={childFadeUp}
      whileHover={{ scale: 1.03, y: -6, transition: { type: "spring", stiffness: 220 } }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl flex flex-col justify-center ${small ? "min-h-[64px]" : "min-h-[88px]"}`}
      style={{ background: "#fff", boxShadow: "0 12px 40px rgba(15,92,46,0.04)" }}
    >
      <p className="text-sm" style={{ color: LINE_DARK }}>{title}</p>
      <h2 className={`font-bold ${small ? "text-lg" : "text-2xl"}`} style={{ color: "#000" }}>{value}</h2>
    </motion.div>
  );
}