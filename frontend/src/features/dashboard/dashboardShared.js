import { useEffect, useState } from "react";

export const LINE_DARK = "#2f6a3f";
export const BAR_GREEN = "rgba(181,245,206,0.95)";
export const PIE_GREEN_1 = "rgba(181,245,206,0.95)";
export const PIE_GREEN_2 = "rgba(181,245,206,0.8)";
export const PIE_GREEN_3 = "rgba(181,245,206,0.55)";
export const BORDER_SUBTLE = "#6ea57a";

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

export const containerVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: -40, scale: 0.96, transition: { duration: 0.45 } },
};

export const childFadeUp = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 12 },
  },
  exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.35 } },
};

export const MONTH_FORMATTER = new Intl.DateTimeFormat("es-CO", {
  month: "short",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function useCountUp(value, duration = 1000) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return display;
}

export function money(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value) {
  return CURRENCY_FORMATTER.format(money(value));
}

export function getMonthBucket(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    label: MONTH_FORMATTER.format(date),
    sort: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
  };
}

export function sortMonthlyValues(map) {
  return [...map.values()]
    .sort((a, b) => a.sort - b.sort)
    .slice(-6);
}

export function isTruthyStatus(value) {
  if (typeof value === "boolean") return value;

  const normalized = String(value || "").trim().toLowerCase();
  return ["true", "activo", "activa", "active", "1", "habilitado"].includes(
    normalized
  );
}

export function getCategoryLabel(product) {
  return (
    product?.categorias?.nombre_categoria ||
    product?.categoria ||
    product?.nombre_categoria ||
    (product?.id_categoria ? `Categoría ${product.id_categoria}` : "Sin categoría")
  );
}

export async function fetchAllPages(url, options = {}) {
  const {
    extractor = (json) => json?.data || [],
    pageParam = "page",
    extraParams = {},
  } = options;

  const items = [];
  let page = 1;
  let totalPages = 1;

  do {
    const target = new URL(url);
    target.searchParams.set(pageParam, String(page));

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value != null) {
        target.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(target.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    items.push(...extractor(json));
    totalPages = Math.max(Number(json?.pagination?.totalPages) || 1, 1);
    page += 1;
  } while (page <= totalPages);

  return items;
}

export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, labels: { color: LINE_DARK } },
    tooltip: {
      backgroundColor: "#fff",
      titleColor: "#000",
      bodyColor: "#000",
      borderColor: "#e5e7eb",
      borderWidth: 1,
    },
  },
};
