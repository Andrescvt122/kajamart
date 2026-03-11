import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../login.jsx";


const mockNavigate = jest.fn();

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
    signIn: jest.fn(),
    loading: false,
  }),
}));

describe("Login.render", () => {
  test("debe renderizar el formulario de inicio de sesión", () => {
    render(<Login />);

    expect(screen.getByText("Bienvenido")).toBeInTheDocument();
    expect(screen.getByText("Inicia sesión para continuar")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ingresar" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver" })).toBeInTheDocument();
  });
});
