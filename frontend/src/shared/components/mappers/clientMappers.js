// frontend/src/shared/mappers/clientMappers.js

// Nombre especial que usamos en toda la app para el cliente genérico de caja
export const CLIENTE_CAJA_NOMBRE = "Cliente de Caja";

/**
 * FRONT (formulario/UI) -> BACK (API / Prisma)
 * Mapea el objeto de formulario al formato que espera tu backend.
 */
export const mapClientToBackend = (form = {}) => ({
  nombre_cliente: form.nombre?.trim() || "",
  tipo_docume: form.tipoDocumento || null,
  numero_doc: form.numeroDocumento?.trim() || "",
  correo_cliente: form.correo?.trim() || null,
  telefono_cliente: form.telefono?.trim() || null,
  // en BD se guarda como boolean: true = activo, false = inactivo
  estado_cliente: form.activo ?? true,
});

/**
 * BACK -> FRONT
 * Mapea el registro que viene de la BD al formato estándar que usa toda tu UI.
 */
export const mapClientFromBackend = (c) => {
  if (!c) return null;

  const esCaja = c.nombre_cliente === CLIENTE_CAJA_NOMBRE;

  // Fallbacks por si tu backend cambia nombres o aún no tiene estado_cliente bien definido
  const estadoBool =
    typeof c.estado_cliente === "boolean"
      ? c.estado_cliente
      : typeof c.estado === "boolean"
      ? c.estado
      : true; // por defecto lo consideramos activo

  // Cliente de Caja SIEMPRE ACTIVO en la UI
  const estadoTexto = esCaja
    ? "Activo"
    : estadoBool
    ? "Activo"
    : "Inactivo";

  return {
    id: String(c.id_cliente ?? c.id ?? ""),
    nombre: c.nombre_cliente ?? "",
    tipoDocumento: c.tipo_docume ?? "",
    numeroDocumento: c.numero_doc ?? "",
    correo: c.correo_cliente ?? "",
    telefono: c.telefono_cliente ?? "",
    // activo como boolean para los switches/toggles
    activo: estadoTexto === "Activo",
    // estado como texto para las etiquetas/verdes-rojas
    estado: estadoTexto,
    // fecha: intenta usar la del backend; si no hay, usa la del día
    fecha:
      c.fecha_creacion ??
      c.created_at ??
      new Date().toISOString().split("T")[0],
  };
};

/**
 * Lista de clientes desde el backend -> lista normalizada para la UI
 */
export const mapClientsFromBackend = (list = []) =>
  Array.isArray(list) ? list.map(mapClientFromBackend).filter(Boolean) : [];

/**
 * Construye el objeto de "Cliente de Caja" usado en localStorage/UI.
 * Úsalo donde hoy estás creando a mano ese cliente para no duplicar lógica.
 */
export const buildClienteCajaLocal = () => ({
  id: "C000",
  nombre: CLIENTE_CAJA_NOMBRE,
  tipoDocumento: "N/A",
  numeroDocumento: "N/A",
  correo: "caja@correo.com",
  telefono: "N/A",
  activo: true,
  estado: "Activo",
  fecha: new Date().toISOString().split("T")[0],
});
