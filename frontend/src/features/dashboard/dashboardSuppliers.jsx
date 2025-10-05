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

/* ---------- Estilos / Colores ---------- */
const LINE_DARK = "#2f6a3f";
const BAR_GREEN = "rgba(181,245,206,0.95)";
const PIE_GREEN_1 = "rgba(181,245,206,0.95)";
const PIE_GREEN_2 = "rgba(181,245,206,0.8)";
const PIE_GREEN_3 = "rgba(181,245,206,0.55)";
const BORDER_SUBTLE = "#6ea57a";

/* ---------- Small number animation hook ---------- */
function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    let rafId = null;
    const step = (t) => {
      if (!start) start = t;
      const prog = Math.min((t - start) / duration, 1);
      setDisplay(Math.round(value * prog));
      if (prog < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);
  return display;
}

/* ---------- Animations ---------- */
const containerVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.06 },
  },
  exit: { opacity: 0, y: -30, scale: 0.96, transition: { duration: 0.45 } },
};
const childFadeUp = {
  initial: { opacity: 0, y: 18, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 16 },
  },
  exit: { opacity: 0, y: -12, scale: 0.99, transition: { duration: 0.32 } },
};
const rowVariants = {
  initial: { opacity: 0, x: -40, rotate: -4, scale: 0.995 },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 14,
      delay: i * 0.02,
    },
  }),
  exit: { opacity: 0, x: 40, rotate: 4, transition: { duration: 0.28 } },
};
const hoverPower = {
  scale: 1.02,
  rotate: -0.6,
  transition: { type: "spring", stiffness: 220, damping: 12 },
};

/* ---------- Component main ---------- */
export default function DashboardSuppliers() {
  /* ---------- Mock data ---------- */
  const rawSuppliers = [
    {
      nit: "200",
      name: "Alimentos La Abundancia",
      contact: "María Rodríguez",
      phone: "3104567890",
      correo: "contacto@abundancia.com",
      category: "Abarrotes",
      type: "Nacional",
      estado: "Activo",
      lastDelivery: "2025-09-25",
      reliability: 0.94,
      totalPurchases: 15200,
    },
    {
      nit: "201",
      name: "Distribuidora El Campesino",
      contact: "Carlos Pérez",
      phone: "3119876543",
      correo: "ventas@elcampesino.com",
      category: "Verduras",
      type: "Local",
      estado: "Inactivo",
      lastDelivery: "2025-09-10",
      reliability: 0.68,
      totalPurchases: 7200,
    },
    {
      nit: "202",
      name: "Refrescos Tropical",
      contact: "Laura Martínez",
      phone: "3201122334",
      correo: "info@refrescostropical.com",
      category: "Bebidas",
      type: "Nacional",
      estado: "Activo",
      lastDelivery: "2025-09-27",
      reliability: 0.88,
      totalPurchases: 8900,
    },
    {
      nit: "203",
      name: "La Gran Cosecha",
      contact: "Andrés Gómez",
      phone: "3129988776",
      correo: "lagrancosecha@correo.com",
      category: "Carnes",
      type: "Local",
      estado: "Activo",
      lastDelivery: "2025-09-19",
      reliability: 0.79,
      totalPurchases: 12400,
    },
    {
      nit: "204",
      name: "Panificadora San Jorge",
      contact: "Elena Suárez",
      phone: "3134455667",
      correo: "ventas@sanjorge.com",
      category: "Panadería",
      type: "Nacional",
      estado: "Activo",
      lastDelivery: "2025-09-23",
      reliability: 0.98,
      totalPurchases: 5400,
    },
  ];

  /* ---------- Métricas ---------- */
  const metricas = useMemo(() => {
    return {
      total: rawSuppliers.length,
      activos: rawSuppliers.filter((s) => s.estado === "Activo").length,
      retrasos: rawSuppliers.filter((s) => s.reliability < 0.75).length,
      comprasTotales: rawSuppliers.reduce(
        (acc, s) => acc + (s.totalPurchases || 0),
        0
      ),
    };
  }, [rawSuppliers]);

  /* ---------- Filtros ---------- */
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [applied, setApplied] = useState(false);

  const clearFilters = () => {
    setSearch("");
    setTipo("");
    setEstado("");
    setDateRange(null);
    setApplied(false);
  };

  const applyFilters = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 900);
  };

  const filterByDate = (itemDate) => {
    if (!dateRange || dateRange.length !== 2) return true;
    const [s, e] = dateRange;
    if (!s || !e) return true;
    const d = new Date(itemDate);
    const sd = new Date(s);
    sd.setHours(0, 0, 0, 0);
    const ed = new Date(e);
    ed.setHours(23, 59, 59, 999);
    return d >= sd && d <= ed;
  };

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawSuppliers
      .filter((s) =>
        q ? `${s.name} ${s.contact} ${s.nit}`.toLowerCase().includes(q) : true
      )
      .filter((s) => (tipo ? s.type.toLowerCase() === tipo.toLowerCase() : true))
      .filter((s) =>
        estado ? s.estado.toLowerCase() === estado.toLowerCase() : true
      )
      .filter((s) => filterByDate(s.lastDelivery));
  }, [rawSuppliers, search, tipo, estado, dateRange]);

  /* ---------- Charts ---------- */
  const topSuppliersChart = useMemo(
    () => ({
      labels: filteredSuppliers.map((s) => s.name),
      datasets: [
        {
          label: "Compras",
          data: filteredSuppliers.map((s) => s.totalPurchases),
          backgroundColor: BAR_GREEN,
          borderColor: BORDER_SUBTLE,
          borderRadius: 12,
          barThickness: 18,
        },
      ],
    }),
    [filteredSuppliers]
  );

  const categoryDistribChart = useMemo(() => {
    const cats = Array.from(new Set(rawSuppliers.map((s) => s.category)));
    const data = cats.map(
      (c) => filteredSuppliers.filter((s) => s.category === c).length
    );
    const palette = [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3];
    return {
      labels: cats,
      datasets: [
        {
          data,
          backgroundColor: cats.map((_, i) => palette[i % palette.length]),
          hoverOffset: 6,
        },
      ],
    };
  }, [rawSuppliers, filteredSuppliers]);

  const commonOptions = useMemo(
    () => ({
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
    }),
    []
  );

  /* ---------- Counters ---------- */
  const totalCount = useCountUp(metricas.total);
  const activosCount = useCountUp(metricas.activos);
  const retrasosCount = useCountUp(metricas.retrasos);
  const comprasCount = useCountUp(metricas.comprasTotales);

  /* ---------- Scroll to top button state & handlers ---------- */
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScroll(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // check on mount
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-suppliers"
        className="p-8 bg-white min-h-screen"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER */}
          <motion.header variants={childFadeUp}>
            <motion.h1 className="text-3xl font-extrabold text-black">
              Gestión de Proveedores
            </motion.h1>
            <motion.p className="text-sm mt-2" style={{ color: LINE_DARK }}>
              Resumen, indicadores y proveedores en riesgo.
            </motion.p>
          </motion.header>

          {/* FILTROS */}
          <motion.section
            variants={childFadeUp}
            className="p-6 rounded-xl"
            style={{
              background: "#fff",
              boxShadow: "0 12px 40px rgba(15,92,46,0.06)",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
              <div className="flex-1">
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>
                  Buscar proveedor
                </label>
                <motion.div
                  whileHover={hoverPower}
                  className="flex items-center gap-2 p-2 rounded-xl"
                  style={{
                    boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)",
                  }}
                >
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre, NIT o contacto..."
                    className="w-full bg-transparent focus:outline-none"
                    style={{ color: "#000" }}
                  />
                  {search && (
                    <motion.button
                      onClick={() => setSearch("")}
                      whileTap={{ scale: 0.92 }}
                      aria-label="clear"
                      style={{
                        padding: 6,
                        borderRadius: 10,
                        background: "transparent",
                      }}
                    >
                      ✕
                    </motion.button>
                  )}
                </motion.div>
              </div>

              <div style={{ minWidth: 200 }}>
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>
                  Tipo
                </label>
                <motion.div
                  whileHover={hoverPower}
                  className="p-2 rounded-xl"
                  style={{
                    boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)",
                  }}
                >
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full bg-transparent p-1"
                    style={{ color: "#000" }}
                  >
                    <option value="" style={{ color: "#000" }}>
                      Todos
                    </option>
                    <option value="Nacional" style={{ color: "#000" }}>
                      Nacional
                    </option>
                    <option value="Local" style={{ color: "#000" }}>
                      Local
                    </option>
                    <option value="Internacional" style={{ color: "#000" }}>
                      Internacional
                    </option>
                  </select>
                </motion.div>
              </div>

              <div style={{ minWidth: 200 }}>
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>
                  Estado
                </label>
                <motion.div
                  whileHover={hoverPower}
                  className="p-2 rounded-xl"
                  style={{
                    boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)",
                  }}
                >
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full bg-transparent p-1"
                    style={{ color: "#000" }}
                  >
                    <option value="" style={{ color: "#000" }}>
                      Todos
                    </option>
                    <option value="Activo" style={{ color: "#000" }}>
                      Activo
                    </option>
                    <option value="Inactivo" style={{ color: "#000" }}>
                      Inactivo
                    </option>
                  </select>
                </motion.div>
              </div>

              <div style={{ minWidth: 260 }}>
                <label className="text-xs block mb-2" style={{ color: LINE_DARK }}>
                  Rango última entrega
                </label>
                <motion.div
                  whileHover={hoverPower}
                  className="rounded-xl overflow-hidden p-1"
                  style={{
                    boxShadow: "inset 0 8px 30px rgba(15,92,46,0.02)",
                  }}
                >
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
                style={{
                  background: BAR_GREEN,
                  color: "#000",
                  boxShadow: "0 12px 40px rgba(15,92,46,0.06)",
                }}
              >
                Limpiar
              </motion.button>

              <motion.button
                onClick={applyFilters}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                className="px-4 py-2 rounded-full font-semibold border"
                style={{ borderColor: BORDER_SUBTLE, color: "#000" }}
              >
                Aplicar
              </motion.button>

              <div className="ml-auto flex items-center gap-2">
                <motion.div
                  animate={
                    applied
                      ? { scale: [1, 1.06, 1], rotate: [0, -2, 0] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.8 }}
                  className="text-sm"
                  style={{ color: LINE_DARK }}
                >
                  {filteredSuppliers.length} proveedores · {metricas.retrasos} con retrasos
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* METRICAS */}
          <motion.div
            variants={childFadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <AnimatedCard title="Total Proveedores" value={totalCount} />
            <AnimatedCard title="Activos" value={activosCount} />
            <AnimatedCard title="Con retrasos" value={retrasosCount} />
            <AnimatedCard
              title="Compras Totales"
              value={`$${comprasCount.toLocaleString()}`}
              small
            />
          </motion.div>

          {/* GRAFICAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl"
              style={{
                background: "#fff",
                boxShadow: "0 12px 40px rgba(15,92,46,0.06)",
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Top proveedores por compras
              </h3>
              <div style={{ height: 240 }}>
                <Bar
                  data={topSuppliersChart}
                  options={{
                    ...commonOptions,
                    indexAxis: "y",
                    animation: { duration: 700 },
                  }}
                />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl"
              style={{
                background: "#fff",
                boxShadow: "0 12px 40px rgba(15,92,46,0.06)",
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Distribución por categoría
              </h3>
              <div style={{ height: 240 }}>
                <Pie
                  data={categoryDistribChart}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </motion.section>
          </div>

          {/* TABLA */}
          <motion.section
            variants={childFadeUp}
            className="p-6 rounded-xl"
            style={{
              background: "#fff",
              boxShadow: "0 12px 40px rgba(15,92,46,0.06)",
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
              Proveedores
            </h3>

            <div className="overflow-x-auto">
              <table
                className="w-full text-left table-auto"
                style={{ borderCollapse: "separate" }}
              >
                <thead>
                  <tr>
                    <th className="p-3 text-sm" style={{ color: "#000" }}>
                      Proveedor
                    </th>
                    <th className="p-3 text-sm" style={{ color: "#000" }}>
                      Contacto
                    </th>
                    <th className="p-3 text-sm" style={{ color: "#000" }}>
                      Teléfono
                    </th>
                    <th className="p-3 text-sm" style={{ color: "#000" }}>
                      Correo
                    </th>
                    <th className="p-3 text-sm" style={{ color: "#000" }}>
                      Última Entrega
                    </th>
                    <th className="p-3 text-sm" style={{ color: "#000" }}>
                      Confiabilidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredSuppliers.map((s, i) => {
                      const lowReliability = s.reliability < 0.75;
                      return (
                        <motion.tr
                          key={s.nit}
                          custom={i}
                          variants={rowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          whileHover={{
                            scale: 1.01,
                            boxShadow: "0 12px 40px rgba(15,92,46,0.04)",
                          }}
                          layout
                        >
                          <td
                            className="p-3"
                            style={{ color: "#000", fontWeight: 700 }}
                          >
                            {s.name}
                          </td>
                          <td className="p-3" style={{ color: "#000" }}>
                            {s.contact}
                          </td>
                          <td className="p-3" style={{ color: "#000" }}>
                            {s.phone}
                          </td>
                          <td className="p-3">
                            <a
                              href={`mailto:${s.correo}`}
                              className="underline text-green-700 hover:text-green-900"
                            >
                              {s.correo}
                            </a>
                          </td>
                          <td className="p-3" style={{ color: "#000" }}>
                            {s.lastDelivery}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${
                                lowReliability
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {Math.round(s.reliability * 100)}%
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {filteredSuppliers.length === 0 && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td
                        colSpan={6}
                        className="p-6 text-center"
                        style={{ color: LINE_DARK }}
                      >
                        No hay proveedores para los filtros seleccionados.
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>

        {/* ------------------ SCROLL TO TOP BUTTON ------------------ */}
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            whileHover={{ scale: 1.06 }}
            onClick={scrollToTop}
            aria-label="Subir al inicio"
            className="fixed right-6 bottom-6 z-50 rounded-full p-3 shadow-lg"
            style={{ background: LINE_DARK, color: "#fff" }}
          >
            ↑
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Animated metric card ---------- */
function AnimatedCard({ title, value, small = false }) {
  return (
    <motion.div
      variants={childFadeUp}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl flex flex-col justify-center ${
        small ? "min-h-[64px]" : "min-h-[88px]"
      }`}
      style={{
        background: "#fff",
        boxShadow: "0 12px 40px rgba(15,92,46,0.04)",
      }}
    >
      <p className="text-sm" style={{ color: LINE_DARK }}>
        {title}
      </p>
      <h2
        className={`font-bold ${small ? "text-lg" : "text-2xl"}`}
        style={{ color: "#000" }}
      >
        {value}
      </h2>
    </motion.div>
  );
}
