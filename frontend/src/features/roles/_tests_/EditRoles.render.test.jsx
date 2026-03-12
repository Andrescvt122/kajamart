import React from "react";
import { render, screen } from "@testing-library/react";
import EditRoles from "../editRoles";

test("renderiza formulario de edición", () => {
  render(
    <EditRoles
      isOpen={true}
      onClose={() => {}}
      role={{
        rol_id: 1,
        rol_nombre: "Administrador",
        descripcion: "Rol principal",
        estado_rol: true
      }}
      onRoleUpdated={() => {}}
    />
  );

  expect(screen.getByText("Editar Rol")).toBeInTheDocument();
});