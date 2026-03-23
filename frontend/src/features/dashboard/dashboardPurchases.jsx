import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
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

// 🎨 COLORES KAJAMART
const GREEN = "#2f6a3f";
const GREEN_LIGHT = "rgba(181,245,206,0.9)";
const GREEN_BG = "rgba(181,245,206,0.25)";
const GRAY = "#e5e7eb";

export default function DashboardComprasPro() {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/kajamart/api/purchase?limit=1000")
      .then(res => res.json())
      .then(data => setPurchases(data.data || data));
  }, []);

  const data = useMemo(() => {

    const semanal = Array(7).fill(0);
    const dias = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

    const proveedores = {};
    const productos = {};
    const estados = {};

    let total = 0;
    let completadas = 0;

    const proveedoresSet = new Set();

    purchases.forEach(c => {
      const totalCompra = Number(c.total || 0);

      // estados
      estados[c.estado_compra] = (estados[c.estado_compra] || 0) + 1;

      if (c.estado_compra !== "Completada") return;

      total += totalCompra;
      completadas++;

      const fecha = new Date(c.fecha_compra);
      semanal[fecha.getDay()] += totalCompra;

      // proveedores
      const prov = c.proveedores?.nombre || "Proveedor";
      proveedores[prov] = (proveedores[prov] || 0) + totalCompra;
      proveedoresSet.add(prov);

      // productos
      (c.detalle_compra || []).forEach(d => {
        const nombre = d.detalle_productos?.productos?.nombre || "Producto";
        productos[nombre] = (productos[nombre] || 0) + d.subtotal;
      });

    });

    return {
      total,
      completadas,
      proveedores: proveedoresSet.size,
      semanal: dias.map((d,i)=>[d,semanal[i]]),

      topProveedores: Object.entries(proveedores)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5),

      productos: Object.entries(productos)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5),

      estados: Object.entries(estados),
    };

  }, [purchases]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Compras</h1>
        <p className="text-sm text-gray-500">Análisis de abastecimiento</p>
      </div>

      {/* 🟩 CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        <Card title="Total Comprado" value={`$${data.total.toLocaleString()}`} />

        <Card title="Compras Completadas" value={data.completadas} />

        <Card title="Proveedores Activos" value={data.proveedores} />

      </div>

      {/* 📊 GRAFICAS */}
      <div className="grid md:grid-cols-2 gap-6 text-black">

        {/* 📈 SEMANA */}
        <Box title="Compras por Semana">
          <Chart>
            <Line
              data={{
                labels: data.semanal.map(d=>d[0]),
                datasets: [{
                label: "Compras ($)",
                data: data.semanal.map(d=>d[1]),
                borderColor: GREEN,
                backgroundColor: GREEN_BG,
                fill:true,
              }]
              }}
              options={options}
            />
          </Chart>
        </Box>

        {/* 🏆 PROVEEDORES */}
        <Box title="Top Proveedores">
          <Chart>
            <Bar
              data={{
                labels: data.topProveedores.map(p=>p[0]),
               datasets: [{
                  label: "Total comprado",
                  data: data.topProveedores.map(p=>p[1]),
                  backgroundColor: GREEN_LIGHT,
                }]
              }}
              options={{...options,indexAxis:"y"}}
            />
          </Chart>
        </Box>

        {/* 📊 ESTADOS */}
        <Box title="Estado de Compras">
          <Chart>
            <Pie
              data={{
                labels: data.estados.map(e=>e[0]),
                datasets: [{
                  label: "Estado de compras",
                  data: data.estados.map(e=>e[1]),
                  backgroundColor:[GREEN,GREEN_LIGHT],
                }]
              }}
              options={options}
            />
          </Chart>
        </Box>

        {/* 📦 PRODUCTOS */}
        <Box title="Compras por Producto">
          <Chart>
            <Bar
              data={{
                labels: data.productos.map(p=>p[0]),
                datasets: [{
                  label: "Inversión por producto",
                  data: data.productos.map(p=>p[1]),
                  backgroundColor: GREEN_LIGHT,
                }]
              }}
              options={{...options,indexAxis:"y"}}
            />
          </Chart>
        </Box>

      </div>
    </div>
  );
}

// COMPONENTES
function Card({ title, value }) {
  return (
    <motion.div className="bg-white p-4 rounded-xl shadow">
      <p className="text-xs text-gray-400">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </motion.div>
  );
}

function Box({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Chart({ children }) {
  return <div className="h-[260px]">{children}</div>;
}