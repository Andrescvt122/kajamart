import react from "react";
export default function DashboardSales() {
  console.log("DashboardSales render");
  return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Dashboard de Ventas</h1>
        <p>Aquí puedes ver un resumen y estadísticas de las ventas.</p>
        {/* Aquí puedes agregar gráficos, tablas y otros componentes relevantes */}
      </div>
  );
}