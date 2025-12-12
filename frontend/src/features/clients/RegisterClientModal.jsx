// src/features/clients/RegisterClientModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
} from "../../shared/components/alerts";
import { useClientCreate } from "../../shared/components/hooks/clients/useClientCreate";
import { useClientUpdate } from "../../shared/components/hooks/clients/useUpdateClient";

const DOC_MIN = 5;
const DOC_MAX = 10;
const PHONE_MIN = 7;
const PHONE_MAX = 10;

const ONLY_LETTERS = /^[a-zA-Z\s]+$/;
const ONLY_DIGITS = /^\d+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterClientModal({
  isModalOpen,
  setIsModalOpen,
  form,
  setForm,
  tipoOptions,
  onClose,
  title,
  editingClientId, // null = crear, número = editar, 0 = Cliente de Caja
  onSuccess,
  allClients = [], // ✅ para validar unicidad en tiempo real (si lo pasas)
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const nombreRef = useRef();
  const tipoRef = useRef();
  const docRef = useRef();
  const correoRef = useRef();
  const telefonoRef = useRef();

  const { createClient, loading: createLoading, error: createError } =
    useClientCreate();
  const { updateClient, loading: updateLoading, error: updateError } =
    useClientUpdate();

  const isLoading = createLoading || updateLoading;
  const globalError = createError || updateError;

  // ---------------- Helpers ----------------
  const closeModal = () => (onClose ? onClose() : setIsModalOpen(false));

  const handleEnter = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const markAllTouched = () => {
    setTouched({
      nombre: true,
      tipoDocumento: true,
      numeroDocumento: true,
      correo: true,
      telefono: true,
    });
  };

  const isDocDuplicate = (numeroDocumento) => {
    if (!numeroDocumento) return false;

    return allClients?.some((c) => {
      const sameDoc =
        String(c.numeroDocumento) === String(numeroDocumento).trim();
      const sameClient =
        editingClientId && String(c.id) === String(editingClientId);
      return sameDoc && !sameClient; // si edito, no me comparo conmigo
    });
  };

  // ✅ Normaliza teléfono: si viene "N/A" lo tratamos como vacío
  const normalizePhone = (raw) => {
    const t = String(raw ?? "").trim();
    if (!t) return "";
    if (t.toUpperCase() === "N/A") return "";
    return t;
  };

  // ---------------- Validación ----------------
  const validate = (values) => {
    const newErrors = {};

    const nombre = values.nombre?.trim() ?? "";
    const tipoDocumento = values.tipoDocumento ?? "";
    const numeroDocumento = values.numeroDocumento?.trim() ?? "";
    const correo = values.correo?.trim() ?? "";
    const telefono = normalizePhone(values.telefono); // ✅ opcional real

    // Nombre (obligatorio)
    if (!nombre) {
      newErrors.nombre = "Nombre es requerido";
    } else if (!ONLY_LETTERS.test(nombre)) {
      newErrors.nombre = "Nombre solo puede contener letras";
    }

    // Tipo de documento (obligatorio)
    if (!tipoDocumento) {
      newErrors.tipoDocumento = "Seleccione un tipo de documento";
    }

    // Documento (obligatorio + formato + longitud + unicidad)
    if (!numeroDocumento) {
      newErrors.numeroDocumento = "Documento es requerido";
    } else if (!ONLY_DIGITS.test(numeroDocumento)) {
      newErrors.numeroDocumento = "Documento solo puede contener números";
    } else if (
      numeroDocumento.length < DOC_MIN ||
      numeroDocumento.length > DOC_MAX
    ) {
      newErrors.numeroDocumento = `El documento debe tener entre ${DOC_MIN} y ${DOC_MAX} dígitos`;
    } else if (isDocDuplicate(numeroDocumento)) {
      newErrors.numeroDocumento = "Ya existe un cliente con esta cédula";
    }

    // Correo (opcional)
    if (correo && !EMAIL_REGEX.test(correo)) {
      newErrors.correo = "Correo inválido";
    }

    // ✅ Teléfono (opcional) -> SOLO valida si hay número real
    if (telefono) {
      if (!ONLY_DIGITS.test(telefono)) {
        newErrors.telefono = "Teléfono solo puede contener números";
      } else if (telefono.length < PHONE_MIN || telefono.length > PHONE_MAX) {
        newErrors.telefono = `El teléfono debe tener entre ${PHONE_MIN} y ${PHONE_MAX} dígitos`;
      }
    }

    return newErrors;
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // ✅ Si llega "N/A" al editar, lo limpiamos para que NO bloquee
  useEffect(() => {
    if (!isModalOpen) return;
    if (editingClientId === 0) return;

    const t = String(form?.telefono ?? "").trim();
    if (t && t.toUpperCase() === "N/A") {
      setForm((prev) => ({ ...prev, telefono: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, editingClientId]);

  // ✅ Validación en tiempo real (incluye unicidad si llega allClients)
  useEffect(() => {
    if (!isModalOpen || editingClientId === 0) return;
    setErrors(validate(form));
  }, [form, isModalOpen, editingClientId, allClients]);

  const resetFormIfCreate = () => {
    if (editingClientId) return;
    setForm({
      nombre: "",
      tipoDocumento: "",
      numeroDocumento: "",
      correo: "",
      telefono: "",
      activo: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cliente de Caja no se edita
    if (editingClientId === 0) {
      showWarningAlert("No se puede editar el Cliente de Caja ⚠️");
      return;
    }

    markAllTouched();

    const currentErrors = validate(form);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      showWarningAlert("Debes corregir los errores del formulario ⚠️");
      return;
    }

    try {
      // ✅ si el teléfono está vacío o "N/A", mandamos vacío (no obligatorio)
      const payloadToSend = {
        ...form,
        telefono: normalizePhone(form.telefono),
      };

      const result = editingClientId
        ? await updateClient(editingClientId, payloadToSend)
        : await createClient(payloadToSend);

      const payload = result?.data ?? result;

      setTouched({});
      setErrors({});
      resetFormIfCreate();

      showSuccessAlert(
        editingClientId
          ? "Cliente actualizado correctamente 🎉"
          : "Cliente registrado correctamente 🎉"
      );

      if (typeof onSuccess === "function") onSuccess(payload);
      else closeModal();
    } catch (err) {
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message;

      showErrorAlert(
        backendMsg ||
          (editingClientId
            ? "No se pudo actualizar el cliente ❌"
            : "No se pudo guardar el cliente ❌")
      );
    }
  };

  // ---------------- Render ----------------
  if (!isModalOpen) return null;

  // Modal especial Cliente de Caja
  if (editingClientId === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={closeModal}
        />
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
              onClick={closeModal}
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={closeModal}
      />

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
              Nombrea y Apellidos<span className="text-red-500">*</span>
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
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              ref={tipoRef}
              value={form.tipoDocumento}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tipoDocumento: e.target.value }))
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
              <p className="text-red-600 text-sm mt-1">{errors.tipoDocumento}</p>
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
                setForm((prev) => ({ ...prev, numeroDocumento: digits }));
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

          {/* Correo */}
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
                setForm((prev) => ({ ...prev, telefono: digits }));
              }}
              onBlur={() => handleBlur("telefono")}
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
              />
            </button>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 col-span-2 mt-6">
            <button
              type="button"
              onClick={closeModal}
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
