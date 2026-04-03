import React from "react";
import { render, screen } from "@testing-library/react";
import DeleteRoleModal from "../deleteRoles";

test("renderiza el modal de eliminación", () => {
  render(
    <DeleteRoleModal
      isOpen={true}
      onClose={() => {}}
      onRoleDeleted={() => {}}
      role={{ rol_id: 1, rol_nombre: "Administrador" }}
    />
  );

  expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
});