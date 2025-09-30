// dashboardReturnClients.jsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardReturnClients() {
  // --- Datos de ejemplo (puedes reemplazarlos por datos reales) ---
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyVolume = useMemo(
    () => [80, 120, 65, 95, 60, 75, 85, 40, 140, 95, 30, 110],
    []
  ); // volumen por mes (ejemplo)
  const totalReturns = useMemo(() => monthlyVolume.reduce((a, b) => a + b, 0), [monthlyVolume]);
  const avgReturnValue = useMemo(() => 75.5, []); // ejemplo de valor promedio

  // Top productos (horiz. bar)
  const topProducts = useMemo(
    () => ({
      labels: ["Producto A", "Producto B", "Producto C", "Producto D", "Producto E"],
      values: [70, 50, 20, 95, 120],
    }),
    []
  );

  // Razones de devolución (vertical bar)
  const reasons = useMemo(
    () => ({
      labels: ["Defectuoso", "Artículo Incorrecto", "Dañado", "No Necesitado", "Otro"],
      values: [18, 22, 15, 20, 12],
    }),
    []
  );

  // --- Configuración y data para las gráficas ---
  const lineData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label: "Volumen mensual",
          data: monthlyVolume,
          borderColor: "#2f6a3f",
          backgroundColor: "rgba(47,106,63,0.06)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    }),
    [months, monthlyVolume]
  );

  const lineOptions = useMemo(
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
        x: {
          grid: { display: false },
          ticks: { color: "#2f6a3f", font: { size: 12 } },
        },
        y: {
          display: false, // estilo similar al mockup (sin numeración)
          grid: { display: false },
        },
      },
    }),
    []
  );

  const horizBarData = useMemo(
    () => ({
      labels: topProducts.labels,
      datasets: [
        {
          label: "Devoluciones",
          data: topProducts.values,
          backgroundColor: "rgba(181,245,206,0.9)", // barra principal (verde claro)
          borderColor: "#6ea57a", // borde sutil al final
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 18,
        },
      ],
    }),
    [topProducts]
  );

  const horizBarOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: { display: false, grid: { display: false } },
        y: {
          ticks: { color: "#2f6a3f", font: { size: 13 } },
          grid: { display: false },
        },
      },
    }),
    []
  );

  const reasonsData = useMemo(
    () => ({
      labels: reasons.labels,
      datasets: [
        {
          label: "Razones",
          data: reasons.values,
          backgroundColor: "rgba(228,243,236,0.95)",
          borderColor: "#6ea57a",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 56,
        },
      ],
    }),
    [reasons]
  );

  const reasonsOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: {
          ticks: { color: "#2f6a3f", font: { size: 12 } },
          grid: { display: false },
        },
        y: { display: false, grid: { display: false } },
      },
    }),
    []
  );

  // --- Layout / Render ---
  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de control devolucion a clientes</h1>
          <p className="text-sm text-emerald-700 mt-2">Analice y gestione las devoluciones de clientes.</p>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Devoluciones Totales</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{totalReturns.toLocaleString()}</span>
            </div>
            <p className="text-sm text-green-600 mt-3">+2.5%</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Valor Promedio de Devolución</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">${avgReturnValue.toFixed(2)}</span>
            </div>
            <p className="text-sm text-green-600 mt-3">+0.8%</p>
          </div>
        </section>

        {/* Line chart: Tendencias */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Devoluciones</h2>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Volumen Mensual de Devoluciones</p>
                <h3 className="text-3xl font-bold mt-2">{totalReturns.toLocaleString()}</h3>
                <p className="text-sm text-emerald-700 mt-2">Últimos 12 Meses <span className="text-green-600 font-medium">+2.5%</span></p>
              </div>
              <div className="flex items-center justify-end">
                {/* espacio para métricas pequeñas si se desea */}
              </div>
            </div>

            <div style={{ height: 220 }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </section>

        {/* Top products (horizontal bars) */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Devoluciones de Productos</h2>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Top 5 Productos Devueltos</p>
            <h3 className="text-xl font-semibold mt-2">5</h3>
            <p className="text-sm text-emerald-700 mt-1 mb-4">Últimos 3 Meses</p>

            <div style={{ height: 220 }}>
              <Bar data={horizBarData} options={horizBarOptions} />
            </div>
          </div>
        </section>

        {/* Reasons */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Razones de Devolución</h2>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Distribución de Razones de Devolución</p>
            <h3 className="text-xl font-semibold mt-2">5</h3>
            <p className="text-sm text-emerald-700 mt-1 mb-4">Últimos 3 Meses</p>

            <div style={{ height: 180 }}>
              <Bar data={reasonsData} options={reasonsOptions} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
