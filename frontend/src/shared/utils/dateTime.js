const APP_TIME_ZONE = "America/Bogota";
const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;
const TIME_PATTERN = /(?:T|\s)\d{2}:\d{2}/;

const formatDateParts = (date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
};

export const formatDateOnly = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.trim().match(DATE_ONLY_PATTERN);
    if (match?.[1]) return match[1];
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : formatDateParts(parsed);
};

export const parseDateTimeValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!TIME_PATTERN.test(trimmed)) return null;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
