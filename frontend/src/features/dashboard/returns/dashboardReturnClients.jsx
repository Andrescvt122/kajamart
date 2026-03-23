import React, { useEffect, useMemo, useState } from "react";
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

const API_BASE = import.meta.env.VITE_API_URL || "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net";
const RETURNS_URL = `${API_BASE}/kajamart/api/returnClients`;
const MONTH_FORMATTER = new Intl.DateTimeFormat("es-CO", { month: "short" });
const money = (value) => Number(value || 0);
const extractReturnClientsPayload = (payload) => ({
  data: Array.isArray(payload)
    ? payload
    : payload?.returnClients || payload?.data || [],
  meta: payload?.meta || null,
});
const getCategoryName = (categoria) => {
  if (Array.isArray(categoria)) {
    return categoria.find((item) => item?.nombre_categoria)?.nombre_categoria;
  }

  return categoria?.nombre_categoria || null;
};
const getReturnedQuantity = (item) =>
  Number(item?.cantidad_cliente_devuelto ?? item?.cantidad ?? 0);

export default function DashboardReturnClients() {
  const [returnClients, setReturnClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true);
      setError("");
      try {
        let allReturns = [];
        let cursor = null;
        const visitedCursors = new Set();

        while (true) {
          const params = new URLSearchParams({ limit: "20" });
          if (cursor != null) params.set("cursor", String(cursor));

          const res = await fetch(`${RETURNS_URL}?${params.toString()}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          const payload = extractReturnClientsPayload(json);

          allReturns = allReturns.concat(payload.data || []);

          const nextCursor = payload.meta?.nextCursor;
          if (nextCursor == null || visitedCursors.has(nextCursor)) break;

          visitedCursors.add(nextCursor);
          cursor = nextCursor;
        }

        setReturnClients(allReturns);
      } catch (err) {
        setError(err?.message || "Error cargando devoluciones");
        setReturnClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const data = useMemo(() => {
    const monthMap = new Map();
    const clientsMap = new Map();
    const reasonsMap = new Map();
    const categoriesMap = new Map();

    let totalAmount = 0;
    let totalReturnedProducts = 0;

    returnClients.forEach((r) => {
      const date = new Date(r.fecha_devolucion || r.ventas?.fecha_venta);
      const returnedItems = r.devolucion_cliente_devuelto || [];
      const returnQuantity =
        returnedItems.reduce(
          (sum, item) => sum + getReturnedQuantity(item),
          0
        ) || Number(r.cantidad_devuelta_cliente || 0);
      const monthKey = Number.isNaN(date.getTime()) ? "Sin fecha" : `${date.getFullYear()}-${date.getMonth()}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + returnQuantity);

      const clientName = r.ventas?.clientes?.nombre_cliente || "Cliente no identificado";
      clientsMap.set(clientName, (clientsMap.get(clientName) || 0) + returnQuantity);

      totalAmount += money(r.total_devolucion_cliente);
      totalReturnedProducts += returnQuantity;

      returnedItems.forEach((item) => {
        const quantity = getReturnedQuantity(item);
        const reason = item?.motivo || "Sin motivo";
        const category =
          getCategoryName(
            item?.detalle_venta?.detalle_productos?.productos?.categorias
          ) ||
          item?.detalle_venta?.detalle_productos?.productos?.nombre_categoria ||
          item?.detalle_venta?.detalle_productos?.productos?.categoria ||
          "Sin categoría";

        reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + quantity);
        categoriesMap.set(category, (categoriesMap.get(category) || 0) + quantity);
      });
    });

    const monthlyVolume = [...monthMap.entries()]
      .map(([key, volume]) => {
        const [year, month] = key.split("-");
        const date = key === "Sin fecha" ? null : new Date(Number(year), Number(month), 1);
        return { mes: date ? MONTH_FORMATTER.format(date) : "Sin fecha", volume, sort: date ? date.getTime() : 0 };
      })
      .sort((a, b) => a.sort - b.sort)
      .slice(-12);

    const topClients = [...clientsMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const reasons = [...reasonsMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const categories = [...categoriesMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      monthlyVolume,
      totalReturns: returnClients.length,
      totalReturnedProducts,
      avgReturnValue: returnClients.length ? totalAmount / returnClients.length : 0,
      topClients,
      reasons,
      categories,
    };
  }, [returnClients]);

  const lineData = useMemo(() => ({
    labels: data.monthlyVolume.map((m) => m.mes),
    datasets: [{
      label: "Volumen mensual",
      data: data.monthlyVolume.map((m) => m.volume),
      borderColor: "#2f6a3f",
      backgroundColor: "rgba(47,106,63,0.06)",
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 3,
    }],
  }), [data.monthlyVolume]);

  const lineOptions = {
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
      x: { grid: { display: false }, ticks: { color: "#2f6a3f", font: { size: 12 } } },
      y: { display: false, grid: { display: false } },
    },
  };

  const topClientsData = useMemo(() => ({
    labels: data.topClients.map((c) => c.label),
    datasets: [{
      label: "Devoluciones",
      data: data.topClients.map((c) => c.value),
      backgroundColor: "rgba(181,245,206,0.9)",
      borderColor: "#6ea57a",
      borderWidth: 1,
      borderRadius: 8,
      barThickness: 18,
    }],
  }), [data.topClients]);

  const horizBarOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { ticks: { color: "#2f6a3f", font: { size: 13 } }, grid: { display: false } },
    },
  };

  const reasonsData = useMemo(() => ({
    labels: data.reasons.map((r) => r.label),
    datasets: [{
      label: "Razones",
      data: data.reasons.map((r) => r.value),
      backgroundColor: "rgba(228,243,236,0.95)",
      borderColor: "#6ea57a",
      borderWidth: 1,
      borderRadius: 6,
      maxBarThickness: 56,
    }],
  }), [data.reasons]);

  const reasonsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { color: "#2f6a3f", font: { size: 12 } }, grid: { display: false } },
      y: { display: false, grid: { display: false } },
    },
  };

  const categoriesData = useMemo(() => ({
    labels: data.categories.map((c) => c.label),
    datasets: [{
      label: "Categorías",
      data: data.categories.map((c) => c.value),
      backgroundColor: "rgba(47,106,63,0.75)",
      borderColor: "#6ea57a",
      borderWidth: 1,
      borderRadius: 6,
      maxBarThickness: 56,
    }],
  }), [data.categories]);

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de control devolucion a clientes</h1>
          <p className="text-sm text-emerald-700 mt-2">Analice y gestione las devoluciones de clientes.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Devoluciones Totales</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{data.totalReturns.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Productos Devueltos</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">{data.totalReturnedProducts.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Valor Promedio de Devolución</p>
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">${data.avgReturnValue.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {loading ? <p className="text-sm text-gray-500 mb-6">Cargando devoluciones...</p> : null}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Devoluciones</h2>
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Volumen Mensual de Productos Devueltos</p>
            <h3 className="text-3xl font-bold mt-2">{data.totalReturnedProducts.toLocaleString()}</h3>
            <div style={{ height: 220 }} className="mt-4"><Line data={lineData} options={lineOptions} /></div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clientes con más devoluciones</h2>
          <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-600">Top 5 clientes</p>
            <div style={{ height: 220 }} className="mt-4"><Bar data={topClientsData} options={horizBarOptions} /></div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Razones de Devolución</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <p className="text-sm text-gray-600">Distribución por motivo reportado</p>
              <div style={{ height: 180 }} className="mt-4"><Bar data={reasonsData} options={reasonsOptions} /></div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías Más Afectadas</h2>
            <div className="rounded-lg border border-green-100 p-6 bg-white shadow-sm">
              <p className="text-sm text-gray-600">Productos devueltos por categoría</p>
              <div style={{ height: 180 }} className="mt-4"><Bar data={categoriesData} options={reasonsOptions} /></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
