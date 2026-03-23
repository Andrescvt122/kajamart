// Archivo: useCreateRole.js

import { useState } from 'react';
import axios from 'axios';
import { showErrorAlert } from '../../alerts.jsx'; 
// Asegúrate de que esta URL sea la correcta para tu API
const API_URL = 'https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api/roles'; 

export const useCreateRole = () => {
    const [loading, setLoading] = useState(false);

    const createRole = async (nuevoRolData) => {
        setLoading(true);
        try {
            const response = await axios.post(API_URL, nuevoRolData);
            setLoading(false);
            // El componente RegisterRoles espera que retornemos algo que evalúe a true
            return response.data; 
        } catch (error) {
            setLoading(false);
            
            // 🚨 MANEJO ESPECÍFICO DE ERRORES DE AXIOS 🚨
            if (axios.isAxiosError(error) && error.response) {
                const statusCode = error.response.status;
                
                // Intentamos obtener el mensaje de error del cuerpo de la respuesta del backend
                // Tu backend envía { error: "El nombre del rol ya existe..." }
                const errorMessage = error.response.data.error || 'Ocurrió un error desconocido.';
                
                if (statusCode === 409) {
                    // Manejo del CONFLICTO DE UNICIDAD (P2002)
                    showErrorAlert(`Conflicto: ${errorMessage}`);
                } else if (statusCode === 400) {
                    // Manejo de Bad Request (ej: campos obligatorios vacíos o IDs de permisos inválidos/P2003)
                    showErrorAlert(`Error de validación: ${errorMessage}`);
                } else {
                    // Otros errores (ej: 500 Internal Server Error)
                    showErrorAlert(`Error del servidor (${statusCode}): ${errorMessage}`);
                }
            } else {
                // Error de red, timeout, etc.
                showErrorAlert('Error de red: No se pudo conectar al servidor.');
            }
            
            // Si hay un error, el hook debe retornar un valor "falsey" (falso)
            // para que el componente RegisterRoles no ejecute showSuccessAlert()
            return false;
        }
    };

    return { createRole, loading };
};