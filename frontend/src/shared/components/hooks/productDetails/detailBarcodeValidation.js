import api from "../../../../api/axiosConfig";

export const DETAIL_BARCODE_DUPLICATE_MESSAGE =
  "El código de barras ya existe";
export const DETAIL_BARCODE_CHECKING_MESSAGE =
  "Validando unicidad del código de barras...";

export function normalizeDetailBarcode(value) {
  return String(value ?? "").trim();
}

export function isValidDetailBarcode(value) {
  return /^\d{13}$/.test(normalizeDetailBarcode(value));
}

export async function validateDetailProductBarcode({
  barcode,
  ignoreDetailId,
} = {}) {
  const normalizedBarcode = normalizeDetailBarcode(barcode);

  const { data } = await api.get("/detailsProducts/validate-barcode", {
    params: {
      codigo_barras: normalizedBarcode,
      ...(ignoreDetailId ? { ignore_id_detalle_producto: ignoreDetailId } : {}),
    },
  });

  return data;
}
