import Swal from "sweetalert2";

// ✅ Alerta de éxito
export const showSuccessAlert = (message) => {
  Swal.fire({
    icon: "success",
    title: "Éxito",
    text: message,
    confirmButtonText: "Aceptar",
  });
};

// ❌ Alerta de error
export const showErrorAlert = (message) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "Cerrar",
  });
};

// ⚠️ Alerta de confirmación
export const showConfirmAlert = async (message) => {
  const result = await Swal.fire({
    title: "Confirmación",
    text: "¿Estas seguro?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
  });
  return result.isConfirmed;
};

// ⚠️ Advertencia
export const showWarningAlert = (message) => {
  Swal.fire({
    icon: "warning",
    title: "Cuidado",
    text: message,
  });
};

// ℹ️ Información
export const showInfoAlert = (message) => {
  Swal.fire({
    icon: "info",
    title: "Información",
    text: message,
  });
};

// ⏳ Cargando
export const showLoadingAlert = (message) => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// ✍️ Input de texto
export const showInputAlert = async (message) => {
  const { value } = await Swal.fire({
    title: message,
    input: "text",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
  });
  return value;
};
