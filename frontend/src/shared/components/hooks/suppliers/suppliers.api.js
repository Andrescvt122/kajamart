import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/kajamart/api/suppliers`;


export const getSuppliers = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getSupplierById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const createSupplier = async (supplier) => {
  const { data } = await axios.post(API_URL, supplier);
  return data;
};

export const updateSupplier = async (id, supplier) => {
  const { data } = await axios.put(`${API_URL}/${id}`, supplier);
  return data;
};

export const deleteSupplier = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};
