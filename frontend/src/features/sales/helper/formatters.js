// ÚNICO archivo con estos helpers
export const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatPercent = (part, whole) => {
  const p = Number(part);
  const w = Number(whole);
  if (!w || isNaN(p) || isNaN(w)) return "0%";
  const pct = (p / w) * 100;
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pct) + "%";
};
