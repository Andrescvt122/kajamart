import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../login.jsx";

const mockNavigate = jest.fn();
const mockSignIn = jest.fn();

jest.mock("../../assets/image.png", () => "image-mock");
jest.mock("../../assets/logo.png", () => "logo-mock");

jest.mock("framer-motion", () => ({
  motion: {
    img: ({ children, ...props }) => {
      const {
        initial,
        animate,
        transition,
        whileHover,
        whileTap,
        exit,
        variants,
        ...rest
      } = props;
      return <img {...rest}>{children}</img>;
    },
    div: ({ children, ...props }) => {
      const {
        initial,
        animate,
        transition,
        whileHover,
        whileTap,
        exit,
        variants,
        ...rest
      } = props;
      return <div {...rest}>{children}</div>;
    },
    tbody: ({ children, ...props }) => {
      const {
        initial,
        animate,
        transition,
        whileHover,
        whileTap,
        exit,
        variants,
        ...rest
      } = props;
      return <tbody {...rest}>{children}</tbody>;
    },
    tr: ({ children, ...props }) => {
      const {
        initial,
        animate,
        transition,
        whileHover,
        whileTap,
        exit,
        variants,
        ...rest
      } = props;
      return <tr {...rest}>{children}</tr>;
    },
  },
}));

jest.mock("lucide-react", () => ({
  Eye: () => <span>Eye</span>,
  EyeOff: () => <span>EyeOff</span>,
}));

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: { from: { pathname: "/app" } },
  }),
}));

jest.mock("../../context/useAtuh.jsx", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    loading: false,
  }),
}));

describe("Login.validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe mantener deshabilitado el botón si faltan datos", () => {
    render(<Login />);

    const button = screen.getByRole("button", { name: "Ingresar" });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "andres@test.com" },
    });

    expect(button).toBeDisabled();
  });

  test("debe mostrar error cuando el login falla", async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      status: 401,
      message: "Credenciales inválidas",
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "andres@test.com" },
    });

    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "andres@test.com",
        password: "12345678",
      });
    });

    expect(screen.getByText("Correo y/o contraseña incorrectas")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("debe navegar a /app cuando el login es exitoso", async () => {
    mockSignIn.mockResolvedValue({ ok: true });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "andres@test.com" },
    });

    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/app", { replace: true });
    });
  });
});
