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
              borderRadius: "8px", // 🔲 cuadrado con bordes sutiles
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

        {/* Enlaces + Contacto */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <nav>
            <h3
              style={{
                fontWeight: "bold",
                color: "#000", // 🖤 negro
                margin: "0 0 0.35rem 0",
              }}
            >
              Enlaces
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.35rem" }}>
                <a
                  href="#"
                  style={{
                    color: "#0f1724",
                    textDecoration: "none",
                    transition: "all .15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#065f46";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0f1724";
                    e.target.style.transform = "none";
                  }}
                >
                  Inicio
                </a>
              </li>
              <li style={{ marginBottom: "0.35rem" }}>
                <a
                  href="#"
                  style={{
                    color: "#0f1724",
                    textDecoration: "none",
                    transition: "all .15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#065f46";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0f1724";
                    e.target.style.transform = "none";
                  }}
                >
                  Servicios
                </a>
              </li>
              <li style={{ marginBottom: "0.35rem" }}>
                <a
                  href="#"
                  style={{
                    color: "#0f1724",
                    textDecoration: "none",
                    transition: "all .15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#065f46";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0f1724";
                    e.target.style.transform = "none";
                  }}
                >
                  Productos
                </a>
              </li>
            </ul>
          </nav>

          <address style={{ fontStyle: "normal" }}>
            <h3
              style={{
                fontWeight: "bold",
                color: "#000", // 🖤 negro
                margin: "0 0 0.35rem 0",
              }}
            >
              Contacto
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.35rem" }}>
                <a
                  href="#"
                  style={{
                    color: "#0f1724",
                    textDecoration: "none",
                    transition: "all .15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#065f46";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0f1724";
                    e.target.style.transform = "none";
                  }}
                >
                  Contacto
                </a>
              </li>
              <li style={{ marginBottom: "0.35rem" }}>
                <a
                  href="#"
                  style={{
                    color: "#0f1724",
                    textDecoration: "none",
                    transition: "all .15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#065f46";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0f1724";
                    e.target.style.transform = "none";
                  }}
                >
                  Soporte
                </a>
              </li>
              <li style={{ marginBottom: "0.35rem" }}>
                <a
                  href="#"
                  style={{
                    color: "#0f1724",
                    textDecoration: "none",
                    transition: "all .15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#065f46";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0f1724";
                    e.target.style.transform = "none";
                  }}
                >
                  Política de privacidad
                </a>
              </li>
            </ul>
          </address>
        </div>

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
