import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterRoles from "../registerRoles";

test("valida nombre corto", async () => {
  render(
    <RegisterRoles
      isOpen={true}
      onClose={() => {}}
      permisosAgrupados={{}}
      onRoleCreated={() => {}}
    />
  );

  const input = screen.getByPlaceholderText("Nombre del rol");

  await userEvent.type(input, "a");

  expect(
    screen.getByText("El nombre debe tener al menos 3 caracteres")
  ).toBeInTheDocument();
});