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
import { useFetchReturnProducts } from "../../../shared/components/hooks/returnProducts/useFetchReturnProducts";

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const sumProductQuantities = (products = []) =>
  products.reduce((acc, product) => acc + (Number(product.quantity) || 0), 0);

const parseDateFromReturn = (item) => {
  if (item?.dateISO) {
    const parsed = new Date(item.dateISO);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (item?.dateReturn) {
    const [day, month, year] = item.dateReturn
      .split(/[\/]/)
      .map((value) => Number(value));

    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year)
    ) {
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
};

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
  const { returns, loading, error } = useFetchReturnProducts();

  const {
    monthLabels,
    monthlyTotals,
    totalReturns12Months,
    averageMonthlyReturns,
    currentMonthTotal,
    monthlyChangeLabel,
    monthlyChangeClass,
    topProducts,
    reasons,
    categories,
    totalReasons,
    totalCategories,
  } = useMemo(() => {
    const now = new Date();
    const startRange = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const monthDates = Array.from({ length: 12 }).map((_, index) =>
      new Date(startRange.getFullYear(), startRange.getMonth() + index, 1)
    );

    const returnsWithDate = (returns || []).map((item) => ({
      ...item,
      parsedDate: parseDateFromReturn(item),
    }));

    const returnsWithinRange = returnsWithDate.filter((item) => {
      if (!item.parsedDate) return false;
      return item.parsedDate >= startRange && item.parsedDate <= now;
    });

    const monthlyTotals = monthDates.map((date) => {
      const month = date.getMonth();
      const year = date.getFullYear();

      return returnsWithinRange.reduce((acc, current) => {
        if (
          current.parsedDate &&
          current.parsedDate.getMonth() === month &&
          current.parsedDate.getFullYear() === year
        ) {
          return acc + sumProductQuantities(current.products);
        }
        return acc;
      }, 0);
    });

    const totalReturns12Months = monthlyTotals.reduce((acc, value) => acc + value, 0);
    const averageMonthlyReturns = totalReturns12Months / 12;
    const currentMonthTotal = monthlyTotals[monthlyTotals.length - 1] || 0;
    const previousMonthTotal = monthlyTotals[monthlyTotals.length - 2] || 0;

    let monthlyChangeLabel = "0%";
    let monthlyChangeValue = null;

    if (previousMonthTotal === 0) {
      monthlyChangeLabel = currentMonthTotal === 0 ? "0%" : "N/A";
    } else {
      const change =
        ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      monthlyChangeValue = change;
      monthlyChangeLabel = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
    }

    const monthlyChangeClass =
      monthlyChangeValue === null
        ? "text-gray-600"
        : monthlyChangeValue < 0
        ? "text-emerald-600"
        : monthlyChangeValue > 0
        ? "text-red-600"
        : "text-gray-600";

    const productTotals = {};
    const reasonTotals = {};
    const categoryTotals = {};

    returnsWithinRange.forEach((item) => {
      item.products?.forEach((product) => {
        const quantity = Number(product.quantity) || 0;
        const productKey = product.name || "Producto sin nombre";
        const reasonKey = product.reason || "Sin motivo";
        const categoryKey = product.category || "Sin categoría";

        productTotals[productKey] = (productTotals[productKey] || 0) + quantity;
        reasonTotals[reasonKey] = (reasonTotals[reasonKey] || 0) + quantity;
        categoryTotals[categoryKey] =
          (categoryTotals[categoryKey] || 0) + quantity;
      });
    });

    const sortEntriesDesc = (entries) =>
      entries.sort(([, valueA], [, valueB]) => valueB - valueA);

    const topProductsEntries = sortEntriesDesc(
      Object.entries(productTotals)
    ).slice(0, 5);
    const reasonsEntries = sortEntriesDesc(Object.entries(reasonTotals));
    const categoriesEntries = sortEntriesDesc(Object.entries(categoryTotals));

    return {
      monthLabels: monthDates.map((date) => MONTH_NAMES[date.getMonth()]),
      monthlyTotals,
      totalReturns12Months,
      averageMonthlyReturns,
      currentMonthTotal,
      monthlyChangeLabel,
      monthlyChangeClass,
      topProducts: {
        labels: topProductsEntries.map(([label]) => label),
        values: topProductsEntries.map(([, value]) => value),
      },
      reasons: {
        labels: reasonsEntries.map(([label]) => label),
        values: reasonsEntries.map(([, value]) => value),
      },
      categories: {
        labels: categoriesEntries.map(([label]) => label),
        values: categoriesEntries.map(([, value]) => value),
      },
      totalReasons: reasonsEntries.reduce((acc, [, value]) => acc + value, 0),
      totalCategories: categoriesEntries.reduce(
        (acc, [, value]) => acc + value,
        0
      ),
    };
  }, [returns]);

  // --- Configuración y datos para las gráficas ---
  const lineData = useMemo(
    () => ({
      labels: monthLabels,
      datasets: [
        {
          label: "Productos devueltos",
          data: monthlyTotals,
          borderColor: "#2f6a3f",
          backgroundColor: "rgba(47,106,63,0.06)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    }),
    [monthLabels, monthlyTotals]
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
      labels: topProducts.labels,
      datasets: [
        {
          label: "Productos devueltos",
          data: topProducts.values,
          backgroundColor: "rgba(181,245,206,0.9)",
          borderColor: "#6ea57a",
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
          label: "Razones de devolución",
          data: reasons.values,
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

  const categoriesDataChart = useMemo(
    () => ({
      labels: categories.labels,
      datasets: [
        {
          label: "Categorías",
          data: categories.values,
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
    [categories]
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

        {(loading || error) && (
          <section className="mb-8">
            {loading && (
              <p className="text-sm text-gray-600">Cargando devoluciones de productos...</p>
            )}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </section>
        )}

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Devueltos</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{totalReturns12Months.toLocaleString()}</span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Últimos 12 Meses</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Devoluciones Este Mes</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{currentMonthTotal.toLocaleString()}</span>
            </div>
            <p className={`text-sm mt-3 ${monthlyChangeClass}`}>{monthlyChangeLabel}</p>
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
                  <h3 className="text-3xl font-bold mt-2">{totalReturns12Months.toLocaleString()}</h3>
                  <p className="text-sm text-emerald-700 mt-2">Últimos 12 Meses</p>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Promedio Mensual</p>
                    <p className="text-xl font-semibold text-gray-900">{Math.round(averageMonthlyReturns || 0)}</p>
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
                <h3 className="text-3xl font-bold mt-2">{topProducts.values.reduce((acc, value) => acc + value, 0).toLocaleString()}</h3>
                <p className="text-sm text-emerald-700 mt-2">Últimos 12 Meses</p>
              </div>
              {topProducts.labels.length ? (
                <div style={{ height: 220 }}>
                  <Bar data={horizBarData} options={horizBarOptions} />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin datos disponibles</p>
              )}
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
                <h3 className="text-xl font-semibold mt-2">{totalReasons.toLocaleString()}</h3>
                <p className="text-sm text-emerald-700 mt-1">Total de casos - Enfoque en vencimiento</p>
              </div>
              {reasons.labels.length ? (
                <div style={{ height: 200 }}>
                  <Bar data={reasonsData} options={reasonsOptions} />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin datos disponibles</p>
              )}
            </div>
          </section>

          {/* Categorías afectadas */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías Más Afectadas</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Productos Devueltos por Categoría</p>
                <h3 className="text-xl font-semibold mt-2">{totalCategories.toLocaleString()}</h3>
                <p className="text-sm text-emerald-700 mt-1">Total afectados</p>
              </div>
              {categories.labels.length ? (
                <div style={{ height: 200 }}>
                  <Bar data={categoriesDataChart} options={categoriesOptions} />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin datos</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}