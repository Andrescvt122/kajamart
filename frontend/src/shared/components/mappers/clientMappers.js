// frontend/src/shared/mappers/clientMappers.js

// FRONT (UI) -> BACK (API / Prisma)
export const mapClientToBackend = (form) => ({
  nombre_cliente: form.nombre,
  tipo_docume: form.tipoDocumento,
  numero_doc: form.numeroDocumento,
  correo_cliente: form.correo || null,
  telefono_cliente: form.telefono || null,
  estado_cliente: form.activo,
});

// BACK -> FRONT (formato que usa toda tu UI)
export const mapClientFromBackend = (c) => ({
  id: String(c.id_cliente),
  nombre: c.nombre_cliente,
  tipoDocumento: c.tipo_docume,
  numeroDocumento: c.numero_doc,
  correo: c.correo_cliente,
  telefono: c.telefono_cliente,
  estado: c.estado_cliente ? "Activo" : "Inactivo",
  fecha: new Date().toISOString().split("T")[0],
});
