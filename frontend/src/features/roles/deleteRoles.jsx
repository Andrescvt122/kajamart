// src/pages/roles/deleteRoles.jsx
import { showConfirmAlert, showSuccessAlert } from "../../shared/components/alerts";

export const handleDeleteRole = async (roleToDelete, setRoles) => {
  const confirmed = await showConfirmAlert(
    `¿Estás seguro de eliminar el rol \"${roleToDelete.NombreRol}\"?`
  );

  if (confirmed) {
    // Simplemente filtramos el rol. AnimatePresence se encargará de la animación de salida.
    setRoles((prev) =>
      prev.filter((r) => r.NombreRol !== roleToDelete.NombreRol)
    );
    showSuccessAlert("Rol eliminado correctamente.");
  }
};
