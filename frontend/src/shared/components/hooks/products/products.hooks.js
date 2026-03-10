// frontend/src/shared/components/hooks/products/products.hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";
const API_URL = `${API_BASE}/products`;

// 🔹 Obtener todos los productos
export const useProducts = (page = 1, limit = 6, search = "") =>
  useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {

      const { data } = await axios.get(
        `${API_URL}?page=${page}&limit=${limit}&search=${search}`
      );

      return data;

    },
    keepPreviousData: true
  });
export const getAllProductsForExport = async (search = "") => {

  const { data } = await axios.get(
    `${API_URL}?page=1&limit=10000&search=${search}`
  );

  return data.data;

};


export const exportProductsToExcel = (products) => {

  const formatted = products.map((p) => ({
    ID: p.id_producto,
    Nombre: p.nombre,
    Categoría: p.categoria,
    Stock: p.stock_actual,
    Precio: p.precio_venta,
    Estado: p.estado ? "Activo" : "Inactivo",
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Productos");

  XLSX.writeFile(wb, "productos.xlsx");

};
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportProductsToPDF = (products) => {

  const doc = new jsPDF();

  const tableData = products.map((p) => [
    p.id_producto,
    p.nombre,
    p.categoria,
    p.stock_actual,
    p.precio_venta,
    p.estado ? "Activo" : "Inactivo",
  ]);

  autoTable(doc, {
    head: [["ID", "Nombre", "Categoría", "Stock", "Precio", "Estado"]],
    body: tableData,
  });

  doc.save("productos.pdf");

};
// 🔹 Obtener producto por ID
export const useProduct = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });

// 🔹 Crear producto (acepta JSON o FormData)
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      if (payload instanceof FormData) {
        const { data } = await axios.post(API_URL, payload);
        return data;
      }
      const { data } = await axios.post(API_URL, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};

// 🔹 Actualizar producto (acepta JSON o FormData)
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { id, data, ...rest } = payload;
      const body = data ?? rest;

      if (body instanceof FormData) {
        const { data: resp } = await axios.put(`${API_URL}/${id}`, body);
        return resp;
      }
      const { data: resp } = await axios.put(`${API_URL}/${id}`, body);
      return resp;
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};

// 🔹 Eliminar producto
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};
