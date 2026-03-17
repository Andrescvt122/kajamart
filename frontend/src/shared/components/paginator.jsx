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
  totalItems,
  goToPage,
  maxButtons = 7,
}) {
  const rawFilteredLength = Number(filteredLength);
  const rawTotalItems = Number(totalItems);
  const hasFilteredLength =
    Number.isFinite(rawFilteredLength) && rawFilteredLength >= 0;
  const hasTotalItems =
    Number.isFinite(rawTotalItems) && rawTotalItems >= 0;
  const safeCurrentPage = Number.isFinite(Number(currentPage)) && Number(currentPage) > 0
    ? Number(currentPage)
    : 1;
  const safeTotalPages = Number.isFinite(Number(totalPages)) && Number(totalPages) > 0
    ? Number(totalPages)
    : 1;
  const safePerPage = Number.isFinite(Number(perPage)) && Number(perPage) > 0
    ? Number(perPage)
    : hasFilteredLength
      ? rawFilteredLength
      : 0;
  const safeTotalItems = hasTotalItems
    ? Math.max(rawTotalItems, hasFilteredLength ? rawFilteredLength : 0)
    : hasFilteredLength
      ? rawFilteredLength
      : 0;

  const fallbackCurrentItems = safePerPage > 0
    ? Math.max(
        0,
        Math.min(safePerPage, safeTotalItems - (safeCurrentPage - 1) * safePerPage)
      )
    : 0;

  const safeCurrentItems = hasFilteredLength
    ? rawFilteredLength
    : fallbackCurrentItems;

  const startItem =
    safeTotalItems > 0 && safeCurrentItems > 0 && safePerPage > 0
      ? (safeCurrentPage - 1) * safePerPage + 1
      : 0;
  const endItem =
    startItem > 0
      ? Math.min(startItem + safeCurrentItems - 1, safeTotalItems)
      : 0;

  const pages = buildPages(safeTotalPages, safeCurrentPage, maxButtons);

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
            {startItem}
          </span>{" "}
          -{" "}
          <span className="p-strong" style={blackStrong}>
            {endItem}
          </span>{" "}
          de{" "}
          <span className="p-strong" style={blackStrong}>
            {safeTotalItems}
          </span>
        </div>

        <div className="paginator-smpage" style={blackText}>
          Página{" "}
          <span className="p-strong" style={blackStrong}>
            {safeCurrentPage}
          </span>{" "}
          / {safeTotalPages}
        </div>
      </div>

      {/* Navegación */}
      <nav className="paginator-nav" aria-label="Paginación">
        <button
          className="p-btn p-nav"
          onClick={() => goToPage(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
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
                className={`p-btn p-page ${p === safeCurrentPage ? "active" : ""}`}
                onClick={() => goToPage(p)}
                aria-current={p === safeCurrentPage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className="p-btn p-nav"
          onClick={() => goToPage(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </nav>
    </div>
  );
}
