import React from "react";
import logo from "../assets/Kajamart.jpeg";

export default function FooterComponent() {
  return (
    <footer
      style={{
        position: "relative",
        left: 0,
        bottom: 0,
        width: "100%",
        background: "#d4e6d7",
        padding: "0.9rem 0",
        boxSizing: "border-box",
        zIndex: 50,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
          padding: "0 1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Logo + Nombre */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img
            src={logo}
            alt="Logo de Kajamart"
            style={{
              width: "56px",
              height: "56px",
              objectFit: "cover",
              borderRadius: "8px",
              display: "block",
              margin: 0,
            }}
          />
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", margin: 0 }}>
              Kajamart
            </h2>
          </div>
        </div>

        {/* Información de contacto */}
        <address style={{ fontStyle: "normal" }}>
          <h3
            style={{
              fontWeight: "bold",
              color: "#000",
              margin: "0 0 0.35rem 0",
            }}
          >
            Contacto
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "0.35rem", color: "#0f1724" }}>
              📞 Teléfono: +57 300 123 4567
            </li>
            <li style={{ marginBottom: "0.35rem", color: "#0f1724" }}>
              ✉️ Correo: contacto@kajamart.com
            </li>
            <li style={{ marginBottom: "0.35rem", color: "#0f1724" }}>
              📍 Dirección: Calle 123 #45-67, Bogotá, Colombia
            </li>
          </ul>
        </address>

        {/* Derechos reservados */}
        <div
          style={{
            fontSize: "12px",
            color: "rgba(0,0,0,0.6)",
            marginTop: "0.5rem",
          }}
        >
          &copy; {new Date().getFullYear()} Kajamart. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
