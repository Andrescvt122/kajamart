import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
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
import { motion } from "framer-motion";

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

// 🎨 COLORES
const GREEN = "#2f6a3f";
const GREEN_LIGHT = "rgba(181,245,206,0.9)";
const GRAY = "#e5e7eb";
const RED = "#ef4444";

export default function DashboardVentas() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/kajamart/api/sales")
      .then(res => res.json())
      .then(data => setSales(data.data || data));
  }, []);

  // =====================
  // 🔥 PROCESAMIENTO
  // =====================
  const data = useMemo(() => {

    const monthly = {};
    const productos = {};
    const categorias = {};
    const metodos = {};
    const estados = {};

    let total = 0;
    const clientes = new Set();

    sales.forEach(s => {
      const fecha = new Date(s.fecha_venta);
      const mes = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      
      monthly[mes] = (monthly[mes] || 0) + Number(s.total);
      total += Number(s.total);

      if (s.id_cliente) clientes.add(s.id_cliente);

      // 💳 métodos de pago
      metodos[s.metodo_pago] = (metodos[s.metodo_pago] || 0) + 1;

      // 📊 estado
      estados[s.estado_venta] = (estados[s.estado_venta] || 0) + 1;

      // 📦 detalle
      (s.detalle_venta || []).forEach(d => {
        const p = d.detalle_productos?.productos;

        const nombre = p?.nombre || "Producto";
        productos[nombre] = (productos[nombre] || 0) + d.subtotal;

        const cat = p?.categorias?.[0]?.nombre_categoria || "Sin categoría";
        categorias[cat] = (categorias[cat] || 0) + d.subtotal;
      });
    });

    // 📅 VENTAS POR DÍA DE LA SEMANA
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const ventasPorDia = Array(7).fill(0);

    sales.forEach(s => {
      const fecha = new Date(s.fecha_venta);
      const dia = fecha.getDay(); // 0=Dom, 1=Lun...
      ventasPorDia[dia] += Number(s.total || 0);
    });


    // 🧠 CLIENTES CON COMPRA REAL
    const clientesConCompra = new Set();

    // 🧠 ESTADO COMPLETADAS
    let ventasCompletadas = 0;

    sales.forEach(s => {
      if (s.id_cliente) clientesConCompra.add(s.id_cliente);

      if (s.estado_venta === "Completada") {
        ventasCompletadas++;
      }
    });

    const porcentajeVentas = sales.length
      ? (ventasCompletadas / sales.length) * 100
      : 0;

    return {
      total,
      transacciones: sales.length,
      ticket: sales.length ? total / sales.length : 0,
      clientes: clientes.size,
      semanal: diasSemana.map((d, i) => [d, ventasPorDia[i]]), 
      clientesUnicos: clientesConCompra.size, 
      porcentajeVentas,
      productos: Object.entries(productos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      categorias: Object.entries(categorias).slice(0, 5),
      metodos: Object.entries(metodos),
      estados: Object.entries(estados),
    };

  }, [sales]);

  // =====================
  // 📊 CHARTS
  // =====================

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Ventas</h1>
        <p className="text-sm text-gray-500">Análisis empresarial de ventas</p>
      </div>

      {/* KPIs */}
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <Card 
        title="Total Ventas" 
        value={`$${data.total.toLocaleString()}`} 
      />

      <Card 
        title="Ventas a Clientes" 
        value={data.clientesUnicos} 
      />

      <Card 
        title="% Ventas Completadas" 
        value={`${data.porcentajeVentas.toFixed(1)}%`} 
      />

      <Card 
        title="Total Ventas (N°)" 
        value={data.transacciones} 
      />

    </div>

      {/* GRAFICAS */}
      <div className="grid md:grid-cols-2 gap-6 text-black">

        {/* 📈 EVOLUCIÓN */}
      <Box title="Evolución de Ventas (Semana)">
        <Chart>
          <Line
            data={{
              labels: data.semanal.map(d => d[0]),
              datasets: [
                {
                  label: "Ventas",
                  data: data.semanal.map(d => d[1]),

                  borderColor: "#2f6a3f",
                  backgroundColor: "rgba(181,245,206,0.25)",

                  borderWidth: 3,
                  tension: 0.45,
                  fill: true,

                  pointRadius: 4,
                  pointBackgroundColor: "#2f6a3f",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,

              animation: {
                duration: 1800,
                easing: "easeOutQuart",
              },

              plugins: {
                legend: { display: false },
              },

              scales: {
                x: {
                  grid: { color: "rgba(47,106,63,0.1)" },
                },
                y: {
                  grid: { color: "rgba(47,106,63,0.1)" },
                  ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </Chart>
      </Box>

        {/* 💳 MÉTODOS */}
        <Box title="Métodos de Pago">
          <Chart>
            <Doughnut
              data={{
                labels: data.metodos.map(m => m[0]),
                datasets: [{
                  data: data.metodos.map(m => m[1]),
                  backgroundColor: [GREEN, GREEN_LIGHT, GRAY],
                }]
              }}
              options={chartOptions}
            />
          </Chart>
        </Box>

        {/* 🏆 PRODUCTOS */}
        <Box title="Top Productos">
          <Chart>
            <Bar
              data={{
                labels: data.productos.map(p => p[0]),
                datasets: [{
                  label: "Ventas por producto", // ✅ FIX
                  data: data.productos.map(p => p[1]),
                  backgroundColor: GREEN_LIGHT,
                  borderRadius: 8,
                }]
              }}
              options={{ ...chartOptions, indexAxis: "y" }}
            />
          </Chart>
        </Box>

        {/* 📊 ESTADO */}
        <Box title="Estado de Ventas">
          <Chart>
            <Pie
              data={{
                labels: data.estados.map(e => e[0]),
                datasets: [{
                  data: data.estados.map(e => e[1]),
                  backgroundColor: [GREEN, GREEN_LIGHT, GRAY],
                }]
              }}
              options={chartOptions}
            />
          </Chart>
        </Box>

      </div>
    </div>
  );
}

// 🎴 CARD
function Card({ title, value }) {
  return (
    <motion.div className="bg-white p-4 rounded-xl shadow">
      <p className="text-xs text-gray-400">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </motion.div>
  );
}

// 📦 BOX
function Box({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

// 📊 CONTENEDOR
function Chart({ children }) {
  return <div className="h-[260px]">{children}</div>;
}
