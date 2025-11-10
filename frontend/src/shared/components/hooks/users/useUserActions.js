// src/shared/components/hooks/users/useUserActions.js

import { useState } from "react";
import axios from "axios";
import { showErrorAlert } from "../../alerts.jsx"; // Asegúrate de que esta ruta sea correcta

// URL base para Creación y Eliminación (POST /users, DELETE /users/:id)
const API_URL_BASE = "http://localhost:3000/users"; 
// URL base para Edición de datos personales y estado (PUT /kajamart/api/users/:id, PUT /kajamart/api/users/:id/status)
const API_URL_EDITION = "http://localhost:3000/kajamart/api/users";

export const useUserActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 1. ACCIONES DE CREACIÓN (POST) ---
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(API_URL_BASE, userData);
      return data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || "Error al crear usuario. El correo o documento ya existe.";
      setError(errorMessage);
      showErrorAlert(errorMessage);
      throw new Error(errorMessage); 
    } finally {
      if (!error) setLoading(false);
    }
  };

  // --- 2. ACCIONES DE EDICIÓN (PUT) ---
  
  const updatePersonalData = async (userId, personalData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API_URL_EDITION}/${userId}`, personalData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Error al actualizar datos personales del usuario ${userId}`;
      setError(errorMessage);
      throw new Error(errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, nuevoEstado) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API_URL_EDITION}/${userId}/status`, { nuevoEstado });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Error al cambiar el estado del usuario ${userId}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ACCIÓN DE ELIMINACIÓN (DELETE) ---
  
  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.delete(`${API_URL_BASE}/${userId}`);
      return data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || `Error al eliminar el usuario ${userId}. Verifique dependencias.`;
      setError(errorMessage);
      showErrorAlert(errorMessage);
      throw new Error(errorMessage);
    } finally {
      if (!error) setLoading(false);
    }
  };

  return { 
    createUser,
    updatePersonalData, 
    toggleUserStatus, 
    deleteUser, 
    loading, 
    error 
  };
};