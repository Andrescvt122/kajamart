// deleteUsers.jsx
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../shared/components/alerts.jsx";

/**
 * Registra el listener global para manejar eliminación de usuarios.
 * 
 * 🔹 Uso:
 * - Desde indexUsers.jsx se dispara:
 *   window.dispatchEvent(new CustomEvent("delete-user", { detail: { user, setUsers } }))
 * 
 * - Este módulo escucha, confirma y elimina.
 */
export default function registerDeleteUserEvent() {
  const handler = async (e) => {
    const { user, setUsers } = e.detail;

    try {
      // Confirmación
      const confirmed = await showConfirmAlert(
        `¿Estás seguro de eliminar al usuario "${user.Nombre}"?`
      );

      if (!confirmed) {
        // ⚠️ Si cancela, no se elimina
        return;
      }

      // 🔥 Eliminar al usuario de la lista
      setUsers((prev) => prev.filter((u) => u.Correo !== user.Correo));

      // ✅ Mostrar confirmación
      showSuccessAlert("El usuario ha sido eliminado con éxito");

      // Emitir evento adicional si necesitas escuchar desde otro módulo
      window.dispatchEvent(
        new CustomEvent("user-deleted", { detail: { user } })
      );
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      showErrorAlert("No se pudo eliminar el usuario");
    }
  };

  // Registrar listener global
  window.addEventListener("delete-user", handler);

  // Retornar cleanup (para desmontar en useEffect de indexUsers)
  return () => {
    window.removeEventListener("delete-user", handler);
  };
}
