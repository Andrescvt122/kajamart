import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/lowProducts";

export const usePostLowProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Formato de imagen invalido"));
      };
      reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });

  const postLowProducts = async (id_responsable, products) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const productsWithTotals = await Promise.all(products.map(async (p) => {
        const toNumberOrNull = (value) => {
          if (value === "" || value === null || value === undefined) {
            return null;
          }

          const num = Number(value);
          return Number.isFinite(num) ? num : null;
        };

        const cantidadOrigen = Number(p.requestedQuantity) || 0;
        const cantidadTraslado = Number(p.cantidad_traslado) || 0;
        const factorConversion =
          cantidadOrigen > 0 ? cantidadTraslado / cantidadOrigen : null;
        const isVentaUnitaria = p.reason === "venta unitaria";
        const pendingRegistration = p.pending_transfer_registration;
        const draftPayload = pendingRegistration?.pendingProduct?.draftPayload;

        let imagenBase64 = null;
        const draftImage = draftPayload?.imagen;
        const isFile =
          (typeof File !== "undefined" && draftImage instanceof File) ||
          (typeof Blob !== "undefined" && draftImage instanceof Blob);

        if (isFile) {
          imagenBase64 = await fileToDataUrl(draftImage);
        }

        const productoDestinoDraft = draftPayload
          ? {
              nombre: draftPayload.nombre,
              descripcion: draftPayload.descripcion || "",
              id_categoria: toNumberOrNull(
                draftPayload.id_categoria,
              ),
              stock_minimo: toNumberOrNull(
                draftPayload.stock_minimo,
              ),
              stock_maximo: toNumberOrNull(
                draftPayload.stock_maximo,
              ),
              costo_unitario: toNumberOrNull(
                draftPayload.costo_unitario,
              ),
              precio_venta: toNumberOrNull(
                draftPayload.precio_venta,
              ),
              cantidad_unitaria: toNumberOrNull(
                draftPayload.cantidad_unitaria,
              ),
              imagen_base64: imagenBase64,
            }
          : null;

        const lowProduct = {
          id_detalle_productos: p.id,
          cantidad: cantidadOrigen,
          motivo: p.reason,
          total_producto_baja: isVentaUnitaria
            ? 0
            : Number(p.unitCost || 0) * cantidadOrigen,
        };

        if (isVentaUnitaria) {
          lowProduct.cantidad_traslado = cantidadTraslado;
          lowProduct.factor_conversion =
            factorConversion && factorConversion > 0 ? factorConversion : null;

          if (pendingRegistration) {
            lowProduct.crear_destino = true;

            if (p.id_producto_destino) {
              lowProduct.id_producto_destino = p.id_producto_destino;
            }

            if (productoDestinoDraft) {
              lowProduct.producto_destino = productoDestinoDraft;
            }

            lowProduct.codigo_barras_destino =
              pendingRegistration?.pendingDetail?.registeredBarcode ?? null;
            lowProduct.fecha_vencimiento_destino =
              pendingRegistration?.pendingDetail?.registeredExpiry ?? null;
          } else {
            lowProduct.id_detalle_destino = p.id_producto_traslado ?? null;
          }
        }

        return lowProduct;
      }));

      const body = {
        id_responsable,
        products: productsWithTotals,
      };

      const res = await axios.post(API_URL, body);

      setResponseData(res.data);
      setSuccess(true);
      return res.data;
    } catch (err) {
      console.error("❌ Error al registrar baja:", err);
      setError(
        err.response?.data?.error || "Error al registrar la baja de productos."
      );
    } finally {
      setLoading(false);
    }
  };

  return { postLowProducts, loading, error, success, responseData };
};
