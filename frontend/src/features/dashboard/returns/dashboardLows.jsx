// dashboardLows.jsx - Dashboard de bajas de productos
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

export default function DashboardLows() {
  // --- Datos de ejemplo para bajas de productos ---
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyLows = useMemo(
    () => [45, 62, 38, 51, 29, 41, 55, 33, 67, 48, 25, 59],
    []
  ); // productos dados de baja por mes
  const totalLows = useMemo(() => monthlyLows.reduce((a, b) => a + b, 0), [monthlyLows]);
  const avgLowValue = useMemo(() => 125.75, []); // valor promedio de productos dados de baja

  // Productos más dados de baja
  const topLowProducts = useMemo(
    () => ({
      labels: ["Producto X", "Producto Y", "Producto Z", "Producto W", "Producto V"],
      values: [89, 67, 45, 78, 52],
    }),
    []
  );

  // Razones de baja
  const lowReasons = useMemo(
    () => ({
      labels: ["Vencido", "Defectuoso", "Obsoleto", "Daño", "Otro"],
      values: [45, 38, 32, 29, 18],
    }),
    []
  );

  // Categorías de productos con más bajas
  const categoriesData = useMemo(
    () => ({
      labels: ["Electrónicos", "Ropa", "Hogar", "Alimentos", "Otros"],
      values: [95, 67, 43, 28, 22],
    }),
    []
  );

  // --- Configuración y datos para las gráficas ---
  const lineData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label: "Productos dados de baja",
          data: monthlyLows,
          borderColor: "#2f6a3f",
          backgroundColor: "rgba(47,106,63,0.06)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    }),
    [months, monthlyLows]
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
          display: false,
          grid: { display: false },
        },
      },
    }),
    []
  );

  const horizBarData = useMemo(
    () => ({
      labels: topLowProducts.labels,
      datasets: [
        {
          label: "Productos dados de baja",
          data: topLowProducts.values,
          backgroundColor: "rgba(181,245,206,0.9)", // barra principal (verde claro)
          borderColor: "#6ea57a", // borde sutil al final
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 18,
        },
      ],
    }),
    [topLowProducts]
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
      labels: lowReasons.labels,
      datasets: [
        {
          label: "Razones de baja",
          data: lowReasons.values,
          backgroundColor: "rgba(228,243,236,0.95)",
          borderColor: "#6ea57a",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 56,
        },
      ],
    }),
    [lowReasons]
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

  const categoriesDataChart = useMemo(
    () => ({
      labels: categoriesData.labels,
      datasets: [
        {
          label: "Categorías",
          data: categoriesData.values,
          backgroundColor: [
            "rgba(47,106,63,0.8)",
            "rgba(79,141,94,0.8)",
            "rgba(111,176,125,0.8)",
            "rgba(143,211,156,0.8)",
            "rgba(175,246,187,0.8)"
          ],
          borderWidth: 2,
          borderRadius: 8,
          hoverBorderWidth: 3,
        },
      ],
    }),
    [categoriesData]
  );

  const categoriesOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#2f6a3f", font: { size: 12 } }
        },
        tooltip: { enabled: true }
      },
      scales: {
        x: { display: false, grid: { display: false } },
        y: {
          ticks: { color: "#2f6a3f", font: { size: 12 } },
          grid: { display: false },
        },
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
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard de Bajas de Productos</h1>
          <p className="text-sm text-emerald-700 mt-2">Gestione y analice las bajas de productos de manera eficiente.</p>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Dados de Baja</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{totalLows.toLocaleString()}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Últimos 12 Meses</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Valor Promedio</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">${avgLowValue.toFixed(2)}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Por producto dado de baja</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Más Afectados</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{topLowProducts.labels.length}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Productos principales</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Bajas Este Mes</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{monthlyLows[monthlyLows.length - 1]}</span>
            </div>
            <p className="text-sm text-green-600 mt-3">-{Math.round((monthlyLows[monthlyLows.length - 1] - monthlyLows[monthlyLows.length - 2]) / monthlyLows[monthlyLows.length - 2] * 100)}%</p>
          </div>
        </section>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tendencia mensual */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Bajas Mensuales</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Bajas</p>
                  <h3 className="text-3xl font-bold mt-2">{totalLows.toLocaleString()}</h3>
                  <p className="text-sm text-emerald-700 mt-2">Últimos 12 Meses</p>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Promedio Mensual</p>
                    <p className="text-xl font-semibold text-gray-900">{Math.round(totalLows / 12)}</p>
                  </div>
                </div>
              </div>
              <div style={{ height: 220 }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </section>

          {/* Productos más dados de baja */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Dados de Baja</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Top Productos con Más Bajas</p>
                <h3 className="text-3xl font-bold mt-2">{topLowProducts.values.reduce((a, b) => a + b, 0)}</h3>
                <p className="text-sm text-emerald-700 mt-2">Últimos 3 Meses</p>
              </div>
              <div style={{ height: 220 }}>
                <Bar data={horizBarData} options={horizBarOptions} />
              </div>
            </div>
          </section>
        </div>

        {/* Razones y categorías */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Razones de baja */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Razones de Baja</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Distribución de Razones</p>
                <h3 className="text-xl font-semibold mt-2">{lowReasons.values.reduce((a, b) => a + b, 0)}</h3>
                <p className="text-sm text-emerald-700 mt-1">Total de casos</p>
              </div>
              <div style={{ height: 200 }}>
                <Bar data={reasonsData} options={reasonsOptions} />
              </div>
            </div>
          </section>

          {/* Categorías afectadas */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías Más Afectadas</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Productos por Categoría</p>
                <h3 className="text-xl font-semibold mt-2">{categoriesData.values.reduce((a, b) => a + b, 0)}</h3>
                <p className="text-sm text-emerald-700 mt-1">Total afectados</p>
              </div>
              <div style={{ height: 200 }}>
                <Bar data={categoriesDataChart} options={categoriesOptions} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}