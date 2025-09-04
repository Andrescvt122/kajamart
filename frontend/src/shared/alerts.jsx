import Swal from "sweetalert2";

// ✅ Éxito (verde principal)
export const showSuccessAlert = (message = "Operación realizada con éxito") => {
  Swal.fire({
    icon: "success",
    title: "Éxito",
    text: message,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#4CAF50", // Verde principal
    background: "#f6ddcc",         // Fondo café claro
    color: "#3e2723",              // Texto marrón oscuro
  });
};

// ❌ Error (rojo, pero en armonía)
export const showErrorAlert = (message = "Ha ocurrido un error inesperado") => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#b23b3b", // Rojo más suave
    background: "#f6ddcc",
    color: "#3e2723",
  });
};

// ⚠️ Confirmación (verde y café)
export const showConfirmAlert = async (
  message = "¿Estás seguro de realizar esta acción?"
) => {
  const result = await Swal.fire({
    title: "Confirmación",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#4CAF50", // Verde principal
    cancelButtonColor: "#a1887f",  // Café claro
    background: "#f6ddcc",
    color: "#3e2723",
  });
  return result.isConfirmed;
};

// ⚠️ Advertencia (naranja pero en la misma paleta)
export const showWarningAlert = (message = "Debes revisar la información") => {
  Swal.fire({
    icon: "warning",
    title: "Cuidado",
    text: message,
    confirmButtonText: "Entendido",
    confirmButtonColor: "#e68923", // Naranja cálido (más sobrio)
    background: "#f6ddcc",
    color: "#3e2723",
  });
};

// ℹ️ Información (azul discreto)
export const showInfoAlert = (message = "Información importante") => {
  Swal.fire({
    icon: "info",
    title: "Información",
    text: message,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#4f83cc", // Azul suave
    background: "#f6ddcc",
    color: "#3e2723",
  });
};

// ⏳ Cargando (sin botón, solo coherencia de fondo)
export const showLoadingAlert = (message = "Procesando...") => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    background: "#f6ddcc",
    color: "#3e2723",
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// ✍️ Input (verde + café)
export const showInputAlert = async (message = "Escribe algo") => {
  const { value } = await Swal.fire({
    title: message,
    input: "text",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#4CAF50", // Verde principal
    cancelButtonColor: "#a1887f",  // Café claro
    background: "#f6ddcc",
    color: "#3e2723",
  });
  return value;
};
