// src/pages/roles/deleteRoles.jsx
import { showConfirmAlert, showSuccessAlert } from "../../shared/components/alerts";

export const handleDeleteRole = async (roleToDelete, setRoles) => {
  const confirmed = await showConfirmAlert(
    `¿Estás seguro de eliminar el rol \"${roleToDelete.NombreRol}\"?`
  );

  if (confirmed) {
    // 1. Animar primero ocultando el rol
    setRoles((prev) =>
      prev.map((r) =>
        r.NombreRol === roleToDelete.NombreRol
          ? { ...r, _deleting: true } // flag temporal para animación
          : r
      )
    );

    // 2. Esperar que termine la animación antes de eliminar
    setTimeout(() => {
      setRoles((prev) =>
        prev.filter((r) => r.NombreRol !== roleToDelete.NombreRol)
      );
      showSuccessAlert("Rol eliminado correctamente.");
    }, 300); // duración de la animación (300ms)
  }
};
