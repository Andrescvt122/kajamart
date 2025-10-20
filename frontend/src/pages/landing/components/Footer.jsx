import React from "react";
import logo from "../../../assets/logo.png"; // nueva ruta del logo
import ondas from "../../../assets/ondasHorizontal.png";

export default function FooterComponent() {
  return (
    <footer
      style={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
        color: "#0f1724",
        backgroundImage: `url(${ondas})`,
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
      }}
    >
      {/* Tarjeta tipo vidrio */}
      <div
        style={{
          width: "100%",
          padding: "3rem 1rem",
          backgroundColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          borderTop: "1px solid rgba(0,255,128,0.3)",
          boxShadow: "0 0 20px rgba(0,255,128,0.2)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
          }}
        >
          {/* Logo grande con nombre debajo */}
          <div
            style={{
              flex: "1 1 50px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <img
              src={logo}
              alt="Logo de Kajamart"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "16px",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Contacto */}
          <div style={{ flex: "1 1 200px" }}>
            <h3
              style={{
                fontWeight: "600",
                fontSize: "1.2rem",
                marginBottom: "0.75rem",
                color: "#0f1724",
                borderBottom: "1px solid rgba(0,255,128,0.2)",
                paddingBottom: "0.25rem",
              }}
            >
              Contacto
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                lineHeight: 2,
                color: "#0f1724cc",
                fontSize: "0.95rem",
              }}
            >
              <li>Teléfono: +57 300 123 4567</li>
              <li>Correo: contacto@kajamart.com</li>
              <li>Dirección: Calle 123 #45-67, Bogotá, Colombia</li>
            </ul>
          </div>

          {/* Desarrolladores */}
          <div style={{ flex: "1 1 200px" }}>
            <h3
              style={{
                fontWeight: "600",
                fontSize: "1.2rem",
                marginBottom: "0.75rem",
                color: "#0f1724",
                borderBottom: "1px solid rgba(0,255,128,0.2)",
                paddingBottom: "0.25rem",
              }}
            >
              Desarrolladores
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                lineHeight: 1.8,
                color: "#0f1724cc",
                fontSize: "0.95rem",
              }}
            >
              <li>Juan José Hernández Yarce</li>
              <li>Andrés Camilo Valencia Toro</li>
              <li>Alejandro Madrid Saldarriaga</li>
              <li>Karoll Nicole Ceballos Uribe</li>
            </ul>
          </div>
        </div>

        {/* Derechos reservados */}
        <div
          style={{
            fontSize: "13px",
            color: "rgba(0,0,0,0.65)",
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          &copy; {new Date().getFullYear()} Kajamart. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
