// DashboardClientes.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale
);

// 🎨 COLORES
const GREEN_MAIN = "#2f6a3f";
const GREEN_LIGHT = "rgba(181,245,206,0.9)";
const GREEN_SOFT = "rgba(181,245,206,0.5)";

// 💰 FORMATO
const formatMoney = (value) => {
  const num = Number(value);
  if (!num || isNaN(num)) return "$ 0";
  if (num >= 1000000) return `$ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$ ${(num / 1000).toFixed(1)}K`;
  return `$ ${num}`;
};

// ⚙️ OPCIONES DE GRAFICAS
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#374151" },
    },
  },
};

export default function DashboardClientes() {
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [c, v] = await Promise.all([
        fetch("http://localhost:3000/kajamart/api/clients"),
        fetch("http://localhost:3000/kajamart/api/sales"),
      ]);

      const clientesData = await c.json();
      const ventasData = await v.json();

      setClientes(clientesData.data || []);
      setVentas(Array.isArray(ventasData) ? ventasData : ventasData.data || []);
    };

    fetchData();
  }, []);

  const clientesReales = clientes.filter(c => c.id_cliente !== 0);
  const totalClientes = clientesReales.length;

  // ESTADO
  const clientesActivos = clientesReales.filter(c => c.estado_cliente === "Activo").length;
  const clientesInactivos = clientesReales.filter(c => c.estado_cliente === "Inactivo").length;

  // COMPRAS
  const clientesConCompra = useMemo(() => {
    const ids = new Set(ventas.map(v => v.id_cliente));
    return clientesReales.filter(c => ids.has(c.id_cliente)).length;
  }, [ventas, clientesReales]);

  const clientesSinCompra = totalClientes - clientesConCompra;

  // PROMEDIO
  const promedioGasto = useMemo(() => {
    const total = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    return clientesConCompra ? total / clientesConCompra : 0;
  }, [ventas, clientesConCompra]);

  // TOP CLIENTES
  const topClientes = useMemo(() => {
    const map = {};
    ventas.forEach(v => {
      map[v.id_cliente] = (map[v.id_cliente] || 0) + Number(v.total || 0);
    });

    return Object.entries(map)
      .map(([id, total]) => {
        const c = clientes.find(x => x.id_cliente == id);
        return { nombre: c?.nombre_cliente || "Cliente", total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [ventas, clientes]);

  // TIPOS DE DOCUMENTO
  const tipos = useMemo(() => {
  const conteo = {};

  clientesReales.forEach(c => {
    let tipo = (c.tipo_docume || "")
      .toString()
      .trim()
      .toUpperCase();

    // 🔥 Normaliza pero respeta formato
    if (tipo === "CC" || tipo === "C C") tipo = "C.C";
    if (tipo === "TI" || tipo === "T I") tipo = "T.I";
    if (tipo === "CE" || tipo === "C E") tipo = "C.E";

    conteo[tipo] = (conteo[tipo] || 0) + 1;
  });

  return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
}, [clientesReales]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard de Clientes
        </h1>
        <p className="text-sm text-gray-500">
          Análisis del comportamiento de clientes
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Card title="Clientes Activos" value={clientesActivos} />
        <Card title="Clientes Inactivos" value={clientesInactivos} />
        <Card title="Promedio $" value={formatMoney(promedioGasto)} />
      </div>

      {/* GRAFICAS */}
      <div className="grid md:grid-cols-2 gap-6">

        <Box title="Top Clientes">
          <ChartContainer>
            <Bar
              data={{
                labels: topClientes.map(c => c.nombre),
                datasets: [
                  {
                    label: "Ventas ($)",
                    data: topClientes.map(c => c.total),
                    backgroundColor: GREEN_LIGHT,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                indexAxis: "y", // 🔥 horizontal (como antes)
                plugins: {
                  legend: { display: false }, // ❌ quita "undefined"
                },
              }}
            />
          </ChartContainer>
        </Box>

        <Box title="Distribución de Compras">
          <ChartContainer>
            <Doughnut
              data={{
                labels: ["Con compras", "Sin compras"],
                datasets: [{
                  data: [clientesConCompra, clientesSinCompra],
                  backgroundColor: [GREEN_MAIN, "#e5e7eb"],
                }],
              }}
              options={chartOptions}
            />
          </ChartContainer>
        </Box>

        <Box title="Estado de Clientes">
          <ChartContainer>
            <PolarArea
              data={{
                labels: ["Activos", "Inactivos"],
                datasets: [{
                  data: [clientesActivos, clientesInactivos],
                  backgroundColor: [GREEN_MAIN, "#ef4444"],
                }],
              }}
              options={chartOptions}
            />
          </ChartContainer>
        </Box>

        <Box title="Tipos de Documento">
          <ChartContainer>
            <Bar
              data={{
                labels: tipos.map(([t]) => t),
                datasets: [
                  {
                    label: "Clientes",
                    data: tipos.map(([, c]) => c),
                    backgroundColor: GREEN_MAIN,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </ChartContainer>
        </Box>

      </div>
    </div>
  );
}

// 🎴 CARD
function Card({ title, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
    >
      <p className="text-xs text-gray-400">{title}</p>
      <h2 className="text-xl font-bold text-gray-800 mt-1">{value}</h2>
    </motion.div>
  );
}

// 📦 BOX
function Box({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

// 📊 CONTENEDOR CLAVE
function ChartContainer({ children }) {
  return (
    <div className="w-full h-[260px] flex items-center justify-center">
      {children}
    </div>
  );
}