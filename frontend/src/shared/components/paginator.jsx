import React from "react";
import '../../index.css';

function buildPages(total, current, maxButtons = 7) {
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  const inner = maxButtons - 2; // reservamos 1 y total
  const half = Math.floor(inner / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, current + half);

  // ajustar cuando estamos cerca de los extremos
  if (current - 1 <= half) {
    start = 2;
    end = inner;
  }
  if (total - current <= half) {
    start = total - inner;
    end = total - 1;
  }

  pages.push(1);
  if (start > 2) pages.push("left-ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("right-ellipsis");
  pages.push(total);

  return pages;
}

export default function Paginator({
  currentPage,
  perPage,
  totalPages,
  filteredLength,
  goToPage,
  maxButtons = 7,
}) {
  const pages = buildPages(totalPages, currentPage, maxButtons);

  // estilo inline: texto negro con sombra blanca
  const blackText = { color: "#000000", textShadow: "1px 1px 2px #ffffff" };
  const blackStrong = {
    color: "#000000",
    fontWeight: 600,
    textShadow: "1px 1px 2px #ffffff",
  };

  return (
    <div className="paginator glass">
      {/* Bloque de info */}
      <div className="paginator-info" style={blackText}>
        <div className="paginator-range" style={blackText}>
          Mostrando{" "}
          <span className="p-strong" style={blackStrong}>
            {(currentPage - 1) * perPage + 1}
          </span>{" "}
          -{" "}
          <span className="p-strong" style={blackStrong}>
            {Math.min(currentPage * perPage, filteredLength)}
          </span>{" "}
          de{" "}
          <span className="p-strong" style={blackStrong}>
            {filteredLength}
          </span>
        </div>

        <div className="paginator-smpage" style={blackText}>
          Página{" "}
          <span className="p-strong" style={blackStrong}>
            {currentPage}
          </span>{" "}
          / {totalPages}
        </div>
      </div>

      {/* Navegación */}
      <nav className="paginator-nav" aria-label="Paginación">
        <button
          className="p-btn p-nav"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        <div className="page-list" role="list">
          {pages.map((p, i) =>
            p === "left-ellipsis" || p === "right-ellipsis" ? (
              <span key={p + i} className="p-ellipsis" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                className={`p-btn p-page ${p === currentPage ? "active" : ""}`}
                onClick={() => goToPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className="p-btn p-nav"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </nav>
    </div>
  );
}
