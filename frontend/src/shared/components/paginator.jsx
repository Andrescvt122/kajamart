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

  // estilo inline para forzar blanco en "Mostrando" y números
  const whiteText = { color: "#ffffff" };
  const whiteStrong = { color: "#ffffff", fontWeight: 600 };

  return (
    <div className="paginator glass">
      {/* Forzamos blanco en todo el bloque de info */}
      <div className="paginator-info" style={whiteText}>
        <div className="paginator-range" style={whiteText}>
          Mostrando{" "}
          <span className="p-strong" style={whiteStrong}>
            {(currentPage - 1) * perPage + 1}
          </span>{" "}
          -{" "}
          <span className="p-strong" style={whiteStrong}>
            {Math.min(currentPage * perPage, filteredLength)}
          </span>{" "}
          de{" "}
          <span className="p-strong" style={whiteStrong}>
            {filteredLength}
          </span>
        </div>

        <div className="paginator-smpage" style={whiteText}>
          Página <span className="p-strong" style={whiteStrong}>{currentPage}</span> / {totalPages}
        </div>
      </div>

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
