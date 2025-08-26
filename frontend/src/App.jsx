import React from "react";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
  showWarningAlert,
  showInfoAlert,
  showLoadingAlert,
  showInputAlert,
} from "./shared/alerts";

export default function App() {
  const handleConfirm = async () => {
    const confirmed = await showConfirmAlert("¿Seguro que deseas eliminar?");
    if (confirmed) {
      showSuccessAlert("Eliminado correctamente ✅");
    } else {
      showErrorAlert("Acción cancelada 🚫");
    }
  };

  const handleInput = async () => {
    const value = await showInputAlert("Escribe tu nombre:");
    if (value) {
      showSuccessAlert(`Hola, ${value} 👋`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Bienvenido Kajamart!!</h1>

      <div className="flex flex-wrap gap-4">
        <button onClick={() => showSuccessAlert("Se guardó correctamente 🎉")} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
          Éxito
        </button>

        <button onClick={() => showErrorAlert("No se pudo guardar ❌")} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700">
          Error
        </button>

        <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          Confirmación
        </button>

        <button onClick={() => showWarningAlert()} className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600">
          Advertencia
        </button>

        <button onClick={() => showInfoAlert()} className="px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700">
          Información
        </button>

        <button onClick={() => showLoadingAlert()} className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700">
          Cargando
        </button>

        <button onClick={handleInput} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
          Input
        </button>
      </div>
    </div>
  );
}
  