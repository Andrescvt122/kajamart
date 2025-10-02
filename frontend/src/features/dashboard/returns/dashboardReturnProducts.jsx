// dashboardReturnProducts.jsx - Dashboard de devoluciones de productos
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

export default function DashboardReturnProducts() {
  // --- Datos de ejemplo para devoluciones de productos ---
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyReturns = useMemo(
    () => [28, 35, 22, 31, 19, 27, 33, 18, 41, 29, 15, 38],
    []
  ); // productos devueltos por mes
  const totalReturns = useMemo(() => monthlyReturns.reduce((a, b) => a + b, 0), [monthlyReturns]);
  const avgReturnValue = useMemo(() => 85.50, []); // valor promedio de productos devueltos

  // Productos más devueltos
  const topReturnedProducts = useMemo(
    () => ({
      labels: ["Producto A", "Producto B", "Producto C", "Producto D", "Producto E"],
      values: [67, 45, 34, 58, 41],
    }),
    []
  );

  // Razones de devolución enfocadas en vencimiento
  const returnReasons = useMemo(
    () => ({
      labels: ["Cerca de Vencer", "Vencido", "Defectuoso", "Cliente Insatisfecho", "Otro"],
      values: [52, 38, 29, 24, 18],
    }),
    []
  );

  // Categorías de productos más devueltos
  const categoriesData = useMemo(
    () => ({
      labels: ["Alimentos", "Medicamentos", "Cosméticos", "Electrónicos", "Otros"],
      values: [78, 65, 43, 31, 19],
    }),
    []
  );

  // --- Configuración y datos para las gráficas ---
  const lineData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label: "Productos devueltos",
          data: monthlyReturns,
          borderColor: "#2f6a3f",
          backgroundColor: "rgba(47,106,63,0.06)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    }),
    [months, monthlyReturns]
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
      labels: topReturnedProducts.labels,
      datasets: [
        {
          label: "Productos devueltos",
          data: topReturnedProducts.values,
          backgroundColor: "rgba(181,245,206,0.9)",
          borderColor: "#6ea57a",
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 18,
        },
      ],
    }),
    [topReturnedProducts]
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
      labels: returnReasons.labels,
      datasets: [
        {
          label: "Razones de devolución",
          data: returnReasons.values,
          backgroundColor: [
            "rgba(47,106,63,0.8)",
            "rgba(79,141,94,0.8)",
            "rgba(228,243,236,0.95)",
            "rgba(181,245,206,0.9)",
            "rgba(175,246,187,0.8)"
          ],
          borderColor: "#6ea57a",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 56,
        },
      ],
    }),
    [returnReasons]
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
            "rgba(220,38,38,0.8)",
            "rgba(245,101,101,0.8)",
            "rgba(252,165,165,0.8)",
            "rgba(254,202,202,0.8)",
            "rgba(254,226,226,0.8)"
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
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard de Devoluciones de Productos</h1>
          <p className="text-sm text-emerald-700 mt-2">Gestione y analice las devoluciones de productos por vencimiento y otras causas.</p>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Devueltos</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{totalReturns.toLocaleString()}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Últimos 12 Meses</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Valor Promedio</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">${avgReturnValue.toFixed(2)}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Por producto devuelto</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Más Devueltos</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{topReturnedProducts.labels.length}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Productos principales</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Devoluciones Este Mes</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{monthlyReturns[monthlyReturns.length - 1]}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">-{Math.round((monthlyReturns[monthlyReturns.length - 1] - monthlyReturns[monthlyReturns.length - 2]) / monthlyReturns[monthlyReturns.length - 2] * 100)}%</p>
          </div>
        </section>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tendencia mensual */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Devoluciones Mensuales</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Devoluciones</p>
                  <h3 className="text-3xl font-bold mt-2">{totalReturns.toLocaleString()}</h3>
                  <p className="text-sm text-emerald-700 mt-2">Últimos 12 Meses</p>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Promedio Mensual</p>
                    <p className="text-xl font-semibold text-gray-900">{Math.round(totalReturns / 12)}</p>
                  </div>
                </div>
              </div>
              <div style={{ height: 220 }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </section>

          {/* Productos más devueltos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Devueltos</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Top Productos con Más Devoluciones</p>
                <h3 className="text-3xl font-bold mt-2">{topReturnedProducts.values.reduce((a, b) => a + b, 0)}</h3>
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
          {/* Razones de devolución enfocadas en vencimiento */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Razones de Devolución</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Razones Principales de Devolución</p>
                <h3 className="text-xl font-semibold mt-2">{returnReasons.values.reduce((a, b) => a + b, 0)}</h3>
                <p className="text-sm text-emerald-700 mt-1">Total de casos - Enfoque en vencimiento</p>
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
                <p className="text-sm text-gray-600">Productos Devueltos por Categoría</p>
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