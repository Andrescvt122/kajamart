// useSearchDetailProduct.js
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api/search";

// 🔧 Normaliza: quita tildes y pone minúsculas
const normalizeText = (text) => {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover tildes
    .toLowerCase(); // todo minúsculas
};

export const useSearchDetailProduct = () => {
  const [productDetail, setProductDetail] = useState(null);
  const [productsFound, setProductsFound] = useState([]);
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

      const q = normalizeText(raw);

      const { data } = await axios.get(
        `${API_BASE_URL}/detailsProducts/${encodeURIComponent(q)}`
      );

      const list = Array.isArray(data) ? data : [];

      // 🔹 quitar duplicados por producto
      const uniqueList = list.filter(
        (item, index, self) =>
          index === self.findIndex(
            (p) => p.productos.id_producto === item.productos.id_producto
            // ^ ajusta a tu nombre de campo (id_producto, id, etc.)
          )
      );

      setProductsFound(uniqueList);

      const first = uniqueList.length > 0 ? uniqueList[0] : null;
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
