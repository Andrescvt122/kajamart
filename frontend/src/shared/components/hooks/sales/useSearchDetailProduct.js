// useSearchDetailProduct.js
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/kajamart/api/search";

// 🔧 Normaliza: quita tildes y pone minúsculas
const normalizeText = (text) => {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover tildes
    .toLowerCase(); // todo minúsculas
};

export const useSearchDetailProduct = () => {
  const [productDetail, setProductDetail] = useState(null);     // primero de la lista
  const [productsFound, setProductsFound] = useState([]);       // lista completa
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState(null);

  const searchByName = useCallback(async (name) => {
    const raw = name?.trim() ?? "";
    if (!raw) {
      setProductsFound([]);
      setProductDetail(null);
      setErrorProduct(null);
      return;
    }

    try {
      setLoadingProduct(true);
      setErrorProduct(null);

      // Normalizamos ANTES de enviar
      const q = normalizeText(raw);

      const { data } = await axios.get(
        `${API_BASE_URL}/detailsProducts/${encodeURIComponent(q)}`
      );

      const list = Array.isArray(data) ? data : [];
      setProductsFound(list);

      const first = list.length > 0 ? list[0] : null;
      setProductDetail(first);

      if (!first) {
        setErrorProduct("No se encontró ningún producto con ese nombre");
      }
    } catch (err) {
      console.error(err);
      setErrorProduct("Error al buscar el producto");
      setProductsFound([]);
      setProductDetail(null);
    } finally {
      setLoadingProduct(false);
    }
  }, []);

  return { productDetail, productsFound, loadingProduct, errorProduct, searchByName };
};
