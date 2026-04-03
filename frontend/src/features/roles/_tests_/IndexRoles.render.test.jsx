import React from "react";
import { render, screen } from "@testing-library/react";
import IndexRoles from "../indexRoles";

// mocks de hooks
jest.mock("../../../shared/components/hooks/roles/useRolesList", () => ({
  useRolesList: () => ({
    roles: [],
    total: 0,
    totalPages: 1,
    loading: false,
    error: null,
    getRoles: jest.fn(),
  }),
}));

jest.mock("../../../shared/components/hooks/roles/usePermisosList", () => ({
  usePermisosList: () => ({
    permisosAgrupados: {},
  }),
}));

jest.mock("../../../context/useAtuh", () => ({
  useAuth: () => ({
    hasPermission: () => true,
    payload: { rol_id: 1 },
  }),
}));

// mocks de componentes visuales
jest.mock("../detailsRoles", () => () => <div />);
jest.mock("../editRoles", () => () => <div />);
jest.mock("../deleteRoles", () => () => <div />);
jest.mock("../registerRoles", () => () => <div />);

jest.mock("../../../shared/components/paginator", () => () => <div />);

test("renderiza la pantalla de gestión de roles", () => {
  render(<IndexRoles />);

  expect(screen.getByText("Gestión de Roles")).toBeInTheDocument();
});