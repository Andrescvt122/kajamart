import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteRoleModal from "../deleteRoles";

test("cierra el modal al cancelar", async () => {
  const onClose = jest.fn();

  render(
    <DeleteRoleModal
      isOpen={true}
      onClose={onClose}
      onRoleDeleted={() => {}}
      role={{ rol_id: 1, rol_nombre: "Administrador" }}
    />
  );

  await userEvent.click(screen.getByText("Cancelar"));

  expect(onClose).toHaveBeenCalled();
});