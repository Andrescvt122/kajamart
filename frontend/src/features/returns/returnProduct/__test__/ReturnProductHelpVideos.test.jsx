import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReturnProductHelpVideos from "../ReturnProductHelpVideos.jsx";

describe("ReturnProductHelpVideos", () => {
  test("debe abrir el panel y mostrar los videos de ayuda", () => {
    render(<ReturnProductHelpVideos />);

    fireEvent.click(screen.getByRole("button", { name: /videos de ayuda/i }));

    expect(
      screen.getByRole("heading", { name: /videos de ayuda/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ver detalles devolución producto")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /abrir/i })).toHaveLength(7);
  });

  test("debe cerrar el panel con escape", () => {
    render(<ReturnProductHelpVideos />);

    fireEvent.click(screen.getByRole("button", { name: /videos de ayuda/i }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.queryByRole("heading", { name: /videos de ayuda/i }),
    ).not.toBeInTheDocument();
  });
});
