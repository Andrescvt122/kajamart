import { useState, useEffect } from "react";
import axios from "axios";

export const usePermisosList = () => {
  const [permisosAgrupados, setPermisosAgrupados] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPermisos = async () => {
      try {
        console.log("🚀 Ejecutando solicitud HTTP real de permisos...");
        const { data } = await axios.get("http://localhost:3000/kajamart/api/permisos");
        console.log("📡 Respuesta real del backend:", data);

        console.log("📡 Datos crudos desde backend:", data);
        console.log("🔍 Tipo de primer permiso en 'Gestión Roles':", typeof data?.["Gestión Roles"]?.[0]);
        console.log("🔍 Valor del primer permiso:", data?.["Gestión Roles"]?.[0]);

        // 🧩 Normaliza para asegurar estructura consistente
        const normalizados = {};
        Object.entries(data).forEach(([modulo, permisos]) => {
          normalizados[modulo] = permisos.map((p) => {
            // Si el permiso ya es un objeto válido
            if (typeof p === "object" && p !== null) {
              return {
                permiso_id: Number(p.permiso_id ?? p.id ?? 0),
                permiso_nombre: p.permiso_nombre ?? p.nombre ?? String(p),
              };
            }

            // ⚠️ Si viene como string (caso incorrecto anterior), lo convertimos
            console.warn(`⚠️ El permiso "${p}" en el módulo "${modulo}" llegó como string. Se genera ID temporal.`);
            return {
              permiso_id: Math.floor(Math.random() * 1000000),
              permiso_nombre: String(p),
            };
          });
        });

        console.log("✅ Permisos normalizados para el front:", normalizados);
        setPermisosAgrupados(normalizados);
      } catch (error) {
        console.error("❌ Error al obtener permisos:", error);
      } finally {
        setLoading(false);
      }
    };

    getPermisos();
  }, []);

  return { permisosAgrupados, loading };
};