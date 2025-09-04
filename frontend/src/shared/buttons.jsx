import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { FiPrinter } from "react-icons/fi";
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
export const ViewButton = ({alert}) => (
  <button className="button-square view-btn" onClick={alert}>
    <FiEye size={20} />
  </button>
);

export const EditButton = ({alert}) => (
  <button className="button-square edit-btn" onClick={alert}>
    <FiEdit2 size={20} />
  </button>
);

export const DeleteButton = ({alert}) => (
  <button className="button-square delete-btn" onClick={alert}>
    <FiTrash2 size={20} />
  </button>
);

/* ----------------------------- */
/* Botones rectangulares grandes */
/* ----------------------------- */
export const CancelButton = ({ children = "Cancelar", alert}) => (
  <button className="btn-cancel" onClick={alert}>
    {children}
  </button>
);

export const SaveButton = ({ children = "Guardar", alert }) => (
  <button className="btn-save" onClick={alert}>
    {children}
  </button>
);

export const DeleteTextButton = ({ children = "Eliminar", alert }) => (
  <button className="btn-deletetext" onClick={alert}>
    {children}
  </button>
);

export const EditTextButton = ({ children = "Editar", alert }) => (
  <button className="btn-edittext" onClick={alert}>
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

/* ----------------------------- */
/* Botón de imprimir */
/* ----------------------------- */
export const PrinterButton = ({ alert }) => (
  <button
    onClick={alert}
    className="button-square edit-btn"
  >
    <FiPrinter size={20} />
  </button>
);