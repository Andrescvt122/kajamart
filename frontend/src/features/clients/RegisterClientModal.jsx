// RegisterClientModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
} from "../../shared/components/alerts";
import { useClientCreate } from "../../shared/components/hooks/clients/useClientCreate";
import { useClientUpdate } from "../../shared/components/hooks/clients/useUpdateClient";

const DOC_MIN = 5;
const DOC_MAX = 15;
const PHONE_MIN = 7;
const PHONE_MAX = 10;

export default function RegisterClientModal({
  isModalOpen,
  setIsModalOpen,
  form,
  setForm,
  tipoOptions,
  onClose,
  title,
  editingClientId, // null = crear, número = editar, 0 = Cliente de Caja
  onSuccess, // callback: desde Clientes o Ventas
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const nombreRef = useRef();
  const tipoRef = useRef();
  const docRef = useRef();
  const correoRef = useRef();
  const telefonoRef = useRef();

  const {
    createClient,
    loading: createLoading,
    error: createError,
  } = useClientCreate();

  const {
    updateClient,
    loading: updateLoading,
    error: updateError,
  } = useClientUpdate();

  const isLoading = createLoading || updateLoading;
  const globalError = createError || updateError;

  // --------- FUNCION DE VALIDACIÓN GLOBAL ----------
  const validate = (values) => {
    const newErrors = {};

    // Nombre
    if (!values.nombre?.trim()) {
      newErrors.nombre = "Nombre es requerido";
    } else if (!/^[a-zA-Z\s]+$/.test(values.nombre)) {
      newErrors.nombre = "Nombre solo puede contener letras";
    }

    // Tipo de documento
    if (!values.tipoDocumento) {
      newErrors.tipoDocumento = "Seleccione un tipo de documento";
    }

    // Número de documento
    if (!values.numeroDocumento?.trim()) {
      newErrors.numeroDocumento = "Documento es requerido";
    } else if (!/^\d+$/.test(values.numeroDocumento)) {
      newErrors.numeroDocumento = "Documento solo puede contener números";
    } else if (
      values.numeroDocumento.length < DOC_MIN ||
      values.numeroDocumento.length > DOC_MAX
    ) {
      newErrors.numeroDocumento = `El documento debe tener entre ${DOC_MIN} y ${DOC_MAX} dígitos`;
    }

    // Correo (opcional)
    if (values.correo) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)) {
        newErrors.correo = "Correo inválido";
      }
    }

    // Teléfono (opcional)
    if (values.telefono) {
      if (!/^\d+$/.test(values.telefono)) {
        newErrors.telefono = "Teléfono solo puede contener números";
      } else if (
        values.telefono.length < PHONE_MIN ||
        values.telefono.length > PHONE_MAX
      ) {
        newErrors.telefono = `El teléfono debe tener entre ${PHONE_MIN} y ${PHONE_MAX} dígitos`;
      }
    }

    return newErrors;
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // ✅ Validación en TIEMPO REAL cada vez que cambia el form
  useEffect(() => {
    if (!isModalOpen || editingClientId === 0) return;
    setErrors(validate(form));
  }, [form, isModalOpen, editingClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cliente de Caja no se edita
    if (editingClientId === 0) {
      showWarningAlert("No se puede editar el Cliente de Caja ⚠️");
      return;
    }

    // Marcamos todos como tocados al intentar guardar
    setTouched({
      nombre: true,
      tipoDocumento: true,
      numeroDocumento: true,
      correo: true,
      telefono: true,
    });

    const currentErrors = validate(form);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      showWarningAlert("Debes corregir los errores del formulario ⚠️");
      return;
    }

    try {
      let result = null;

      // Actualizar o crear según editingClientId
      if (editingClientId) {
        result = await updateClient(editingClientId, { ...form });
      } else {
        result = await createClient({ ...form });
      }

      if (result) {
        setTouched({});
        setErrors({});

        // Muchos hooks devuelven { data }, otros devuelven el objeto directo
        const payload = result?.data ?? result;

        // Reset solo cuando es creación
        if (!editingClientId) {
          setForm({
            nombre: "",
            tipoDocumento: "",
            numeroDocumento: "",
            correo: "",
            telefono: "",
            activo: true,
          });
        }

        showSuccessAlert(
          editingClientId
            ? "Cliente actualizado correctamente 🎉"
            : "Cliente registrado correctamente 🎉"
        );

        if (typeof onSuccess === "function") {
          onSuccess(payload);
        } else {
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error(error);
      showErrorAlert(
        editingClientId
          ? "No se pudo actualizar el cliente ❌"
          : "No se pudo guardar el cliente ❌"
      );
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleEnter = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  if (!isModalOpen) return null;

  // Modal especial Cliente de Caja
  if (editingClientId === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={() => (onClose ? onClose() : setIsModalOpen(false))}
        ></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="relative bg-white text-black rounded-xl shadow-lg p-6 w-full max-w-md z-10"
        >
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Cliente de Caja
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Este cliente es especial y no se puede editar.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => (onClose ? onClose() : setIsModalOpen(false))}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => (onClose ? onClose() : setIsModalOpen(false))}
      ></div>

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="relative bg-white text-black rounded-xl shadow-lg p-6 w-full max-w-2xl z-10"
      >
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>

        {globalError && (
          <p className="mb-4 text-red-600 text-sm">{globalError}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              ref={nombreRef}
              type="text"
              placeholder="Ingrese el nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              onBlur={() => handleBlur("nombre")}
              onKeyDown={(e) => handleEnter(e, tipoRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                touched.nombre && errors.nombre
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {touched.nombre && errors.nombre && (
              <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Tipo de Documento */}
          <div className="col-span-2 md:col-span-1 relative">
            <label className="block mb-1 font-medium">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              ref={tipoRef}
              value={form.tipoDocumento}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tipoDocumento: e.target.value,
                }))
              }
              onBlur={() => handleBlur("tipoDocumento")}
              onKeyDown={(e) => handleEnter(e, docRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black appearance-none ${
                touched.tipoDocumento && errors.tipoDocumento
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            >
              <option value="">Seleccione</option>
              {tipoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {touched.tipoDocumento && errors.tipoDocumento && (
              <p className="text-red-600 text-sm mt-1">
                {errors.tipoDocumento}
              </p>
            )}
          </div>

          {/* Número de Documento */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              ref={docRef}
              type="text"
              placeholder="Ingrese número de documento"
              inputMode="numeric"
              maxLength={DOC_MAX}
              value={form.numeroDocumento}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setForm((prev) => ({
                  ...prev,
                  numeroDocumento: digits,
                }));
              }}
              onBlur={() => handleBlur("numeroDocumento")}
              onKeyDown={(e) => handleEnter(e, correoRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                touched.numeroDocumento && errors.numeroDocumento
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {touched.numeroDocumento && errors.numeroDocumento && (
              <p className="text-red-600 text-sm mt-1">
                {errors.numeroDocumento}
              </p>
            )}
          </div>

          {/* Correo Electrónico (opcional) */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">Correo Electrónico</label>
            <input
              ref={correoRef}
              type="email"
              placeholder="ejemplo@correo.com"
              value={form.correo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, correo: e.target.value }))
              }
              onBlur={() => handleBlur("correo")}
              onKeyDown={(e) => handleEnter(e, telefonoRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                touched.correo && errors.correo
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {touched.correo && errors.correo && (
              <p className="text-red-600 text-sm mt-1">{errors.correo}</p>
            )}
          </div>

          {/* Teléfono (opcional) */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">Número de Teléfono</label>
            <input
              ref={telefonoRef}
              type="text"
              placeholder="Ingrese número de teléfono"
              inputMode="numeric"
              maxLength={PHONE_MAX}
              value={form.telefono}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setForm((prev) => ({
                  ...prev,
                  telefono: digits,
                }));
              }}
              onBlur={() => handleBlur("telefono")}
              onKeyDown={(e) => handleEnter(e, null)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                touched.telefono && errors.telefono
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {touched.telefono && errors.telefono && (
              <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Toggle Activo */}
          <div className="col-span-2 flex items-center gap-3 mt-2">
            <span className="font-medium text-black">Activo:</span>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, activo: !prev.activo }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                form.activo ? "bg-green-500" : "bg-gray-300"
              }`}
              disabled={isLoading}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                  form.activo ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 col-span-2 mt-6">
            <button
              type="button"
              onClick={() => (onClose ? onClose() : setIsModalOpen(false))}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading
                ? "Guardando..."
                : editingClientId
                ? "Actualizar Cliente"
                : "Registrar Cliente"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
