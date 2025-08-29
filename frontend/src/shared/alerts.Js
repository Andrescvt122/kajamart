import Swal from "sweetalert2";

// ✅ Alerta de éxito
export const showSuccessAlert = (message = "Operación realizada con éxito") => {
  Swal.fire({
    icon: "success",
    title: "Éxito",
    text: message,
    confirmButtonText: "Aceptar",
  });
};

// ❌ Alerta de error
export const showErrorAlert = (message = "Ha ocurrido un error inesperado") => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "Cerrar",
  });
};

// ⚠️ Alerta de confirmación
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
  });
  return result.isConfirmed;
};

// ⚠️ Advertencia
export const showWarningAlert = (message = "Debes revisar la información") => {
  Swal.fire({
    icon: "warning",
    title: "Advertencia",
    text: message,
  });
};

// ℹ️ Información
export const showInfoAlert = (message = "Información importante") => {
  Swal.fire({
    icon: "info",
    title: "Información",
    text: message,
  });
};

// ⏳ Cargando
export const showLoadingAlert = (message = "Procesando...") => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// ✍️ Input de texto
export const showInputAlert = async (message = "Escribe algo") => {
  const { value } = await Swal.fire({
    title: message,
    input: "text",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
  });
  return value;
};
