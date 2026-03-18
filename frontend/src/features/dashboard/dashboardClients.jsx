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
import { AnimatePresence, motion } from "framer-motion";
import {
  API_BASE,
  BAR_GREEN,
  BORDER_SUBTLE,
  LINE_DARK,
  PIE_GREEN_1,
  PIE_GREEN_2,
  PIE_GREEN_3,
  childFadeUp,
  commonChartOptions,
  containerVariants,
  fetchAllPages,
  formatCurrency,
  getMonthBucket,
  money,
  sortMonthlyValues,
  useCountUp,
  isTruthyStatus,
} from "./dashboardShared";

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

const CLIENTS_URL = `${API_BASE}/kajamart/api/clients`;
const SALES_URL = `${API_BASE}/kajamart/api/sales`;

const extractClients = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.clients)) return json.clients;
  if (Array.isArray(json?.clientes)) return json.clientes;
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

const extractSales = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.sales)) return json.sales;
  if (Array.isArray(json?.ventas)) return json.ventas;
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

function normalizeClients(clients) {
  const uniqueClients = new Map();

  clients.forEach((client) => {
    if (!client?.id_cliente || client.id_cliente === 0) return;
    uniqueClients.set(client.id_cliente, client);
  });

  return [...uniqueClients.values()];
}

function AnimatedCard({ title, value }) {
  return (
    <div className="p-4 rounded-xl flex flex-col justify-center min-h-[88px] bg-white shadow">
      <p className="text-sm" style={{ color: LINE_DARK }}>
        {title}
      </p>
      <h2 className="font-bold text-2xl text-black">{value}</h2>
    </div>
  );
}

export default function DashboardClientes() {
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const [clientsData, salesData] = await Promise.all([
          fetchAllPages(CLIENTS_URL, { extractor: extractClients }),
          fetchAllPages(SALES_URL, {
            extractor: extractSales,
            extraParams: { limit: 100 },
          }),
        ]);

        setClients(normalizeClients(clientsData));
        setSales(salesData);
      } catch (err) {
        setError(err?.message || "Error cargando dashboard de clientes");
        setClients([]);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const computed = useMemo(() => {
    const monthlyMap = new Map();
    const topClientsMap = new Map();
    const typeMap = new Map();
    const firstMonthByClient = new Map();
    const salesByClient = new Map();

    clients.forEach((client) => {
      const type = client?.tipo_docume || "Sin tipo";
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    sales
      .filter((sale) => sale?.estado_venta !== "Anulada")
      .forEach((sale) => {
        const bucket = getMonthBucket(sale?.fecha_venta);
        if (!bucket) return;

        if (!monthlyMap.has(bucket.key)) {
          monthlyMap.set(bucket.key, {
            mes: bucket.label,
            valor: 0,
            sort: bucket.sort,
            clientes: new Set(),
          });
        }

        const clientId = Number(sale?.id_cliente);
        const monthEntry = monthlyMap.get(bucket.key);

        if (Number.isFinite(clientId) && clientId > 0) {
          monthEntry.clientes.add(clientId);
          if (!firstMonthByClient.has(clientId) || monthEntry.sort < firstMonthByClient.get(clientId).sort) {
            firstMonthByClient.set(clientId, {
              key: bucket.key,
              sort: monthEntry.sort,
            });
          }

          salesByClient.set(clientId, (salesByClient.get(clientId) || 0) + money(sale?.total));
        }

        monthEntry.valor = monthEntry.clientes.size;
      });

    salesByClient.forEach((total, clientId) => {
      const client = clients.find((item) => item.id_cliente === clientId);
      topClientsMap.set(
        client?.nombre_cliente || `Cliente ${clientId}`,
        total
      );
    });

    const monthlyClients = sortMonthlyValues(monthlyMap);
    const latestMonth = monthlyClients.at(-1);
    const previousMonth = monthlyClients.at(-2);

    const clientesNuevos = latestMonth
      ? [...firstMonthByClient.values()].filter(
          (entry) => entry.key === `${new Date(latestMonth.sort).getFullYear()}-${new Date(latestMonth.sort).getMonth()}`
        ).length
      : 0;

    const crecimientoMensual =
      previousMonth && previousMonth.valor > 0
        ? ((latestMonth?.valor || 0) - previousMonth.valor) / previousMonth.valor * 100
        : 0;

    return {
      clientesMensuales: monthlyClients,
      topClientes: [...topClientsMap.entries()]
        .map(([label, valor]) => ({ label, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
      tiposClientes: [...typeMap.entries()]
        .map(([tipo, valor]) => ({ tipo, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
      metricas: {
        totalClientes: clients.length,
        clientesNuevos,
        clientesActivos: clients.filter((client) =>
          isTruthyStatus(client?.estado_cliente)
        ).length,
        crecimientoMensual,
      },
    };
  }, [clients, sales]);

  const filteredClientesMensuales = useMemo(() => {
    if (!searchTerm) return computed.clientesMensuales;
    const term = searchTerm.toLowerCase();
    return computed.clientesMensuales.filter(
      (item) =>
        item.mes.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.clientesMensuales, searchTerm]);

  const filteredTopClientes = useMemo(() => {
    if (!searchTerm) return computed.topClientes;
    const term = searchTerm.toLowerCase();
    return computed.topClientes.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.topClientes, searchTerm]);

  const filteredTipos = useMemo(() => {
    if (!searchTerm) return computed.tiposClientes;
    const term = searchTerm.toLowerCase();
    return computed.tiposClientes.filter(
      (item) =>
        item.tipo.toLowerCase().includes(term) ||
        String(item.valor).includes(searchTerm)
    );
  }, [computed.tiposClientes, searchTerm]);

  const clientesChart = useMemo(
    () => ({
      labels: filteredClientesMensuales.map((item) => item.mes),
      datasets: [
        {
          type: "line",
          label: "Clientes con ventas",
          data: filteredClientesMensuales.map((item) => item.valor),
          borderColor: LINE_DARK,
          backgroundColor: "rgba(181,245,206,0.1)",
          tension: 0.3,
        },
        {
          type: "bar",
          label: "Clientes activos por mes",
          data: filteredClientesMensuales.map((item) => item.valor),
          backgroundColor: BAR_GREEN,
        },
      ],
    }),
    [filteredClientesMensuales]
  );

  const topClientesChart = useMemo(
    () => ({
      labels: filteredTopClientes.map((item) => item.label),
      datasets: [
        {
          label: "Ventas",
          data: filteredTopClientes.map((item) => item.valor),
          backgroundColor: BAR_GREEN,
          borderColor: BORDER_SUBTLE,
          borderRadius: 12,
        },
      ],
    }),
    [filteredTopClientes]
  );

  const tiposPie = useMemo(
    () => ({
      labels: filteredTipos.map((item) => item.tipo),
      datasets: [
        {
          data: filteredTipos.map((item) => item.valor),
          backgroundColor: [PIE_GREEN_1, PIE_GREEN_2, PIE_GREEN_3],
        },
      ],
    }),
    [filteredTipos]
  );

  const totalCount = useCountUp(computed.metricas.totalClientes);
  const nuevosCount = useCountUp(computed.metricas.clientesNuevos);
  const activosCount = useCountUp(computed.metricas.clientesActivos);
  const crecimientoCount = useCountUp(computed.metricas.crecimientoMensual);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-clientes"
        className="p-8 bg-white min-h-screen"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.header variants={childFadeUp}>
            <h1 className="text-3xl font-extrabold text-black">
              Dashboard Clientes
            </h1>
            <p className="text-sm mt-2" style={{ color: LINE_DARK }}>
              Resumen general de los clientes
            </p>
            {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
          </motion.header>

          <motion.div variants={childFadeUp} className="mb-6 flex justify-end">
            <input
              type="text"
              placeholder="Buscar en todo..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="p-2 rounded-lg border border-gray-300 w-full sm:w-64"
            />
          </motion.div>

          <motion.div
            variants={childFadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <AnimatedCard title="Total Clientes" value={totalCount} />
            <AnimatedCard title="Clientes Nuevos" value={nuevosCount} />
            <AnimatedCard title="Clientes Activos" value={activosCount} />
            <AnimatedCard
              title="Crecimiento (%)"
              value={`${crecimientoCount}%`}
            />
          </motion.div>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando clientes...</p>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow"
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Evolucion Mensual
              </h3>
              <div style={{ height: 240 }}>
                <Line data={clientesChart} options={commonChartOptions} />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow"
            >
              <h3 className="font-semibold mb-3" style={{ color: LINE_DARK }}>
                Top Clientes
              </h3>
              <div style={{ height: 240 }}>
                <Bar
                  data={topClientesChart}
                  options={{ ...commonChartOptions, indexAxis: "y" }}
                />
              </div>
            </motion.section>

            <motion.section
              variants={childFadeUp}
              className="p-6 rounded-xl bg-white shadow lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: LINE_DARK }}>
                  Tipos de Clientes
                </h3>
                <span className="text-sm text-gray-500">
                  Top clientes:{" "}
                  {computed.topClientes[0]
                    ? `${computed.topClientes[0].label} (${formatCurrency(
                        computed.topClientes[0].valor
                      )})`
                    : "Sin ventas"}
                </span>
              </div>
              <div style={{ height: 240 }}>
                <Pie data={tiposPie} options={commonChartOptions} />
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
