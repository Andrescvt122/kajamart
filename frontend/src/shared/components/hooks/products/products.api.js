// frontend/src/shared/components/hooks/products/products.api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/kajamart/api/products`;

export const getProducts = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const createProduct = async (product) => {
  const { data } = await axios.post(API_URL, product);
  return data;
};

export const updateProduct = async (id, product) => {
  const { data } = await axios.put(`${API_URL}/${id}`, product);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};
