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
import { useGetLowProducts } from "../../../shared/components/hooks/lowProducts/useGetLowProducts";

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

const computeAnalytics = (lows = []) => {
  const now = new Date();
  const months = [];
  const monthlyCounts = Array(12).fill(0);
  let totalProducts12Months = 0;
  let totalValue12Months = 0;
  let currentMonthTotal = 0;
  let previousMonthTotal = 0;

  const topProductsMap = new Map();
  const reasonsMap = new Map();
  const categoriesMap = new Map();

  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousMonthYear = previousMonthDate.getFullYear();

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const rawLabel = date
      .toLocaleString("es-CO", { month: "short" })
      .replace(".", "");
    const formattedLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
    months.push(formattedLabel);
  }

  lows.forEach((low) => {
    const lowDate = new Date(low.dateLow);
    if (Number.isNaN(lowDate.getTime())) return;

    const year = lowDate.getFullYear();
    const month = lowDate.getMonth();
    const diffMonths = (now.getFullYear() - year) * 12 + (now.getMonth() - month);

    const productCount = (low.products || []).reduce(
      (sum, product) => sum + Number(product.lowQuantity ?? product.quantity ?? 0),
      0
    );

    const totalValue = Number(low.total ?? 0);

    if (diffMonths >= 0 && diffMonths < 12) {
      totalProducts12Months += productCount;
      totalValue12Months += totalValue;
      const index = 11 - diffMonths;
      monthlyCounts[index] += productCount;
    }

    if (year === now.getFullYear() && month === now.getMonth()) {
      currentMonthTotal += productCount;
    }

    if (year === previousMonthYear && month === previousMonth) {
      previousMonthTotal += productCount;
    }

    if (diffMonths >= 0 && diffMonths < 3) {
      low.products?.forEach((product) => {
        const qty = Number(product.lowQuantity ?? product.quantity ?? 0);
        const label = product.name || "Producto sin nombre";
        topProductsMap.set(label, (topProductsMap.get(label) || 0) + qty);
      });
    }

    if (diffMonths >= 0 && diffMonths < 12) {
      low.products?.forEach((product) => {
        const qty = Number(product.lowQuantity ?? product.quantity ?? 0);
        const reason = product.reason || "Sin motivo";
        const category =
          product.category ||
          product.categoryName ||
          product.categoria ||
          product.nombre_categoria ||
          product.nombreCategoria ||
          product.category_label ||
          "Sin categoría";

        reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + qty);
        categoriesMap.set(category, (categoriesMap.get(category) || 0) + qty);
      });
    }
  });

  const topProducts = Array.from(topProductsMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const reasons = Array.from(reasonsMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const categories = Array.from(categoriesMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const totalReasons = reasons.reduce((sum, item) => sum + item.value, 0);
  const totalCategories = categories.reduce((sum, item) => sum + item.value, 0);

  const averageValue =
    totalProducts12Months > 0 ? totalValue12Months / totalProducts12Months : 0;

  const variationPercentage =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : null;

  return {
    months,
    monthlyCounts,
    totalProducts12Months,
    averageValue,
    monthlyAverage: totalProducts12Months / 12,
    currentMonthTotal,
    previousMonthTotal,
    variationPercentage,
    topProducts,
    reasons,
    categories,
    totalReasons,
    totalCategories,
  };
};

export default function DashboardLows() {
  const { data: lows, loading, error } = useGetLowProducts();

  const analytics = useMemo(() => computeAnalytics(lows), [lows]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("es-CO"), []);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2,
      }),
    []
  );

  const topProductsTotal = useMemo(
    () => analytics.topProducts.reduce((sum, item) => sum + item.value, 0),
    [analytics.topProducts]
  );

  const hasLineData = analytics.monthlyCounts.some((value) => value > 0);
  const hasTopProducts = analytics.topProducts.length > 0;
  const hasReasonData = analytics.reasons.length > 0;
  const hasCategoryData = analytics.categories.length > 0;

  const variationPercentage = analytics.variationPercentage;
  const variationText =
    variationPercentage === null
      ? "N/A"
      : `${variationPercentage > 0 ? "+" : ""}${variationPercentage.toFixed(1)}%`;
  const variationClass =
    variationPercentage === null
      ? "text-gray-500"
      : variationPercentage > 0
      ? "text-red-600"
      : variationPercentage < 0
      ? "text-green-600"
      : "text-gray-600";

  const lineData = useMemo(
    () => ({
      labels: analytics.months,
      datasets: [
        {
          label: "Total de Bajas",
          data: analytics.monthlyCounts,
          borderColor: "#2f6a3f",
          backgroundColor: "rgba(47,106,63,0.06)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    }),
    [analytics.months, analytics.monthlyCounts]
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
      labels: analytics.topProducts.map((item) => item.label),
      datasets: [
        {
          label: "Productos dados de baja",
          data: analytics.topProducts.map((item) => item.value),
          backgroundColor: "rgba(181,245,206,0.9)",
          borderColor: "#6ea57a",
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 18,
        },
      ],
    }),
    [analytics.topProducts]
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
      labels: analytics.reasons.map((item) => item.label),
      datasets: [
        {
          label: "Razones de baja",
          data: analytics.reasons.map((item) => item.value),
          backgroundColor: "rgba(228,243,236,0.95)",
          borderColor: "#6ea57a",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 56,
        },
      ],
    }),
    [analytics.reasons]
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
      labels: analytics.categories.map((item) => item.label),
      datasets: [
        {
          label: "Categorías",
          data: analytics.categories.map((item) => item.value),
          backgroundColor: [
            "rgba(47,106,63,0.8)",
            "rgba(79,141,94,0.8)",
            "rgba(111,176,125,0.8)",
            "rgba(143,211,156,0.8)",
            "rgba(175,246,187,0.8)",
          ],
          borderWidth: 2,
          borderRadius: 8,
          hoverBorderWidth: 3,
        },
      ],
    }),
    [analytics.categories]
  );

  const categoriesOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#2f6a3f", font: { size: 12 } },
        },
        tooltip: { enabled: true },
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

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Dashboard de Bajas de Productos
          </h1>
          <p className="text-sm text-emerald-700 mt-2">
            Gestione y analice las bajas de productos de manera eficiente.
          </p>
        </header>

        {loading && (
          <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
            Actualizando información de bajas...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Dados de Baja</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {numberFormatter.format(analytics.totalProducts12Months)}
              </span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Últimos 12 Meses</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Valor Promedio</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {currencyFormatter.format(analytics.averageValue)}
              </span>
            </div>
            <p className="text-sm text-emerald-700 mt-3">Por producto dado de baja</p>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Bajas Este Mes</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {numberFormatter.format(analytics.currentMonthTotal)}
              </span>
            </div>
            <p className={`text-sm mt-3 ${variationClass}`}>
              Variación vs. mes anterior: {variationText}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tendencia de Bajas Mensuales
            </h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Bajas</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {numberFormatter.format(analytics.totalProducts12Months)}
                  </h3>
                  <p className="text-sm text-emerald-700 mt-2">Últimos 12 Meses</p>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Promedio Mensual</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {numberFormatter.format(Math.round(analytics.monthlyAverage || 0))}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ height: 220 }}>
                {hasLineData ? (
                  <Line data={lineData} options={lineOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Sin información disponible
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Productos Más Dados de Baja
            </h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Top Productos con Más Bajas</p>
                <h3 className="text-3xl font-bold mt-2">
                  {numberFormatter.format(topProductsTotal)}
                </h3>
                <p className="text-sm text-emerald-700 mt-2">Últimos 3 Meses</p>
              </div>
              <div style={{ height: 220 }}>
                {hasTopProducts ? (
                  <Bar data={horizBarData} options={horizBarOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Sin información disponible
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Razones de Baja
            </h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Distribución de Razones</p>
                <h3 className="text-xl font-semibold mt-2">
                  {numberFormatter.format(analytics.totalReasons)}
                </h3>
                <p className="text-sm text-emerald-700 mt-1">Total de casos</p>
              </div>
              <div style={{ height: 200 }}>
                {hasReasonData ? (
                  <Bar data={reasonsData} options={reasonsOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Sin información disponible
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categorías Más Afectadas
            </h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Productos por Categoría</p>
                <h3 className="text-xl font-semibold mt-2">
                  {numberFormatter.format(analytics.totalCategories)}
                </h3>
                <p className="text-sm text-emerald-700 mt-1">Total afectados</p>
              </div>
              <div style={{ height: 200 }}>
                {hasCategoryData ? (
                  <Bar data={categoriesDataChart} options={categoriesOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Sin datos
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
