import { useMutation } from "@tanstack/react-query";
import api from "../../../api/axiosConfig";

export function useCreatePurchase() {
  return useMutation({
    mutationFn: async ({ jsonPayload, comprobanteFile }) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(jsonPayload));

      // ✅ importante: si no hay archivo, NO lo mandes
      if (comprobanteFile) {
        formData.append("comprobante", comprobanteFile);
      }

      const { data } = await api.post("/purchase", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },
  });
}
