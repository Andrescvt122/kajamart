import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

import { AiFillFileExcel, AiFillFilePdf } from "react-icons/ai";

/* ----------------------------- */
/* Función helper para animación al click */
const withClickAnimation = (Component, className) => {
  return ({ children }) => {
    const handleClick = (e) => {
      const btn = e.currentTarget;
      btn.classList.add("active-click");
      setTimeout(() => btn.classList.remove("active-click"), 150); // duración animación
    };
    return (
      <Component className={className} onClick={handleClick}>
        {children}
      </Component>
    );
  };
};

/* ----------------------------- */
/* Botones cuadrados con iconos  */
/* ----------------------------- */
export const ViewButton = () => (
  <button className="button-square view-btn" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    <FiEye size={20} />
  </button>
);

export const EditButton = () => (
  <button className="button-square edit-btn" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    <FiEdit2 size={20} />
  </button>
);

export const DeleteButton = () => (
  <button className="button-square delete-btn" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    <FiTrash2 size={20} />
  </button>
);

/* ----------------------------- */
/* Botones rectangulares grandes */
/* ----------------------------- */
export const CancelButton = ({ children = "Cancelar" }) => (
  <button className="btn-cancel" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    {children}
  </button>
);

export const SaveButton = ({ children = "Guardar" }) => (
  <button className="btn-save" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    {children}
  </button>
);

export const DeleteTextButton = ({ children = "Eliminar" }) => (
  <button className="btn-deletetext" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    {children}
  </button>
);

export const EditTextButton = ({ children = "Editar" }) => (
  <button className="btn-edittext" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    {children}
  </button>
);

/* ----------------------------- */
/* Botón X de cerrar             */
/* ----------------------------- */
export const CloseButton = () => (
  <button className="btn-close" onClick={(e) => {
    e.currentTarget.classList.add("active-click");
    setTimeout(() => e.currentTarget.classList.remove("active-click"), 150);
  }}>
    <FiX size={24} />
  </button>
);



/* ----------------------------- */
/* Botones rectangulares pequeños para exportar */
/* ----------------------------- */
export const ExportExcelButton = ({ children = "Exportar" }) => (
  <button className="btn-export-excel">
    <AiFillFileExcel size={18} />
    {children}
  </button>
);

export const ExportPDFButton = ({ children = "Exportar" }) => (
  <button className="btn-export-pdf">
    <AiFillFilePdf size={18} />
    {children}
  </button>
);