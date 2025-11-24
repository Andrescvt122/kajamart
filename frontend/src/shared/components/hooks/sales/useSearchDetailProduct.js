// useSearchDetailProduct.js
import { useState, useCallback } from "react";
import axios from "axios";

// URL base del backend
const API_BASE_URL = "http://localhost:3000/kajamart/api/search";

// 🔧 Normaliza: quita tildes y pone minúsculas
const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover tildes
    .toLowerCase(); // todo minúsculas
};

export const useSearchDetailProduct = () => {
  const [productDetail, setProductDetail] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState(null);

  const searchByName = useCallback(async (name) => {
    if (!name) return;

    try {
      setLoadingProduct(true);
      setErrorProduct(null);

      // 👇 Normalizar ANTES de enviar
      const q = normalizeText(name);

      const { data } = await axios.get(
        `${API_BASE_URL}/detailsProducts/${encodeURIComponent(q)}`
      );

      const first = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!first) {
        setProductDetail(null);
        setErrorProduct("No se encontró ningún producto con ese nombre");
        return;
      }

      setProductDetail(first);
    } catch (err) {
      console.error(err);
      setErrorProduct("Error al buscar el producto");
      setProductDetail(null);
    } finally {
      setLoadingProduct(false);
    }
  }, []);

  return { productDetail, loadingProduct, errorProduct, searchByName };
};
