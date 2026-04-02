const ACTIVE_STATUS_VALUES = new Set([
  "active",
  "activo",
  "activos",
  "true",
  "1",
]);

const INACTIVE_STATUS_VALUES = new Set([
  "inactive",
  "inactivo",
  "inactivos",
  "annulled",
  "anulado",
  "anulados",
  "false",
  "0",
]);

export const toStatusFilterParam = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (ACTIVE_STATUS_VALUES.has(normalized)) return "active";
  if (INACTIVE_STATUS_VALUES.has(normalized)) return "inactive";

  return undefined;
};
