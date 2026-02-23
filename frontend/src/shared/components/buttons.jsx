import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { FiPrinter, FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiLoader, FiMessageSquare } from "react-icons/fi";
import { AiFillFileExcel, AiFillFilePdf } from "react-icons/ai";
import { showConfirmAlert, showErrorAlert, showInfoAlert, showInputAlert, showLoadingAlert, showSuccessAlert, showWarningAlert } from "./alerts";

/* ----------------------------- */
/* Función helper para animación al click */
const withClickAnimation = (Component, className) => {
  return ({ children }) => {
    const handleClick = (e) => {
      const btn = e.currentTarget;
      btn.classList.add("active-click");
      setTimeout(() => btn.classList.remove("active-click"), 150); // duración animación
    };    return (
      <Component className={className} onClick={handleClick}>
        {children}
      </Component>
    );
  };
};

/* ----------------------------- */
/* Botones cuadrados con iconos  */
/* ----------------------------- */
export const ViewButton = ({event}) => (
  <button className="button-square view-btn" onClick={event}>
    <FiEye size={20} />
  </button>
);

export const ViewDetailsButton = ({event}) => (
  <button className="button-square view-btn" onClick={event}>
    <FiEye size={20} />
  </button>
);

export const EditButton = ({event, canEdit}) => (
  (canEdit && (<button className="button-square edit-btn" onClick={event} hidden={true}>
    <FiEdit2 size={20} />
  </button>))
  
);

export const DeleteButton = ({event, canDelete}) => (
  (canDelete && (
    <button className="button-square delete-btn" onClick={event} hidden={!canDelete}>
    <FiTrash2 size={20} />
  </button>)
  ));

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
export const ExportExcelButton = ({ event, children = "Exportar" }) => (
  <button
    className="btn-export-excel"
    onClick={() => {
      if (typeof event === "function") event();
    }}
  >
    <AiFillFileExcel size={18} />
    {children}
  </button>
);

export const ExportPDFButton = ({ event, children = "Exportar" }) => (
  <button
    className="btn-export-pdf"
    onClick={() => {
      if (typeof event === "function") event();
    }}
  >
    <AiFillFilePdf size={18} />
    {children}
  </button>
);

/* ----------------------------- */
/* Botón de imprimir */
/* ----------------------------- */
export const PrinterButton = ({ event, alert }) => {
  const handler = typeof event === "function" ? event : typeof alert === "function" ? alert : undefined;
  return (
    <button
      onClick={handler}
      className="button-square edit-btn"
    >
      <FiPrinter size={20} />
    </button>
  );
};


{/* Botones de prueba para las alertas */}
<div className="flex flex-wrap gap-4 mt-8">
{/* Éxito */}
<button 
  onClick={() => showSuccessAlert("Se guardó correctamente 🎉")}
  className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg shadow hover:bg-[#43a047]"
>
  Éxito
</button>

{/* Error */}
<button
  onClick={() => showErrorAlert("No se pudo guardar ❌")}
  className="px-4 py-2 bg-[#b23b3b] text-white rounded-lg shadow hover:bg-[#9a2c2c]"
>
  Error
</button>

{/* Confirmación */}
<button
  onClick={async () => {
    const confirmed = await showConfirmAlert(
      "¿Seguro que deseas continuar?"
    );
    if (confirmed) {
      showSuccessAlert("Confirmado ✅");
    } else {
      showErrorAlert("Acción cancelada 🚫");
    }
  }}
  className="px-4 py-2 bg-[#6d4c41] text-white rounded-lg shadow hover:bg-[#5d4037]"
>
  Confirmación
</button>

{/* Advertencia */}
<button
  onClick={() =>
    showWarningAlert("Debes revisar la información ⚠️")
  }
  className="px-4 py-2 bg-[#e68923] text-white rounded-lg shadow hover:bg-[#cf7114]"
>
  Advertencia
</button>

{/* Información */}
<button
  onClick={() => showInfoAlert("Esto es solo información ℹ️")}
  className="px-4 py-2 bg-[#4f83cc] text-white rounded-lg shadow hover:bg-[#3c6cab]"
>
  Información
</button>

{/* Cargando */}
<button
  onClick={() => showLoadingAlert("Procesando...")}
  className="px-4 py-2 bg-[#a1887f] text-white rounded-lg shadow hover:bg-[#8d6e63]"
>
  Cargando
</button>

{/* Input */}
<button
  onClick={async () => {
    const value = await showInputAlert("Escribe tu nombre:");
    if (value) {
      showSuccessAlert(`Hola, ${value} 👋`);
    }
  }}
  className="px-4 py-2 bg-[#3e2723] text-white rounded-lg shadow hover:bg-[#2c1816]"
>
  Input
</button>
</div>
