import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
} from "../../shared/components/alerts";

export default function RegisterClientModal({
  isModalOpen,
  setIsModalOpen,
  form,
  setForm,
  tipoOptions,
  addClient,
  onClose,
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const nombreRef = useRef();
  const tipoRef = useRef();
  const docRef = useRef();
  const correoRef = useRef();
  const telefonoRef = useRef();

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

  // Validaciones en tiempo real
  useEffect(() => {
    const newErrors = {};
    if (touched.nombre) {
      if (!form.nombre.trim()) newErrors.nombre = "Nombre es requerido";
      else if (!/^[a-zA-Z\s]+$/.test(form.nombre))
        newErrors.nombre = "Nombre solo puede contener letras";
    }
    if (touched.numeroDocumento) {
      if (!form.numeroDocumento.trim())
        newErrors.numeroDocumento = "Documento es requerido";
      else if (!/^\d+$/.test(form.numeroDocumento))
        newErrors.numeroDocumento = "Documento solo puede contener números";
    }
    if (touched.correo && form.correo) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
        newErrors.correo = "Correo inválido";
    }
    if (touched.telefono && form.telefono) {
      if (!/^\d+$/.test(form.telefono))
        newErrors.telefono = "Teléfono solo puede contener números";
    }
    if (touched.tipoDocumento && !form.tipoDocumento) {
      newErrors.tipoDocumento = "Seleccione un tipo de documento";
    }
    setErrors(newErrors);
  }, [form, touched]);

  // Registrar cliente
  const handleSubmit = (e) => {
    e.preventDefault();

    const mandatoryFields = ["nombre", "numeroDocumento", "tipoDocumento"];
    let missing = {};
    mandatoryFields.forEach((f) => {
      if (!form[f] || form[f].toString().trim() === "")
        missing[f] = "Campo obligatorio";
    });

    if (Object.keys(errors).length > 0 || Object.keys(missing).length > 0) {
      setErrors({ ...errors, ...missing });
      showWarningAlert("Debes completar los campos obligatorios ⚠️");
      return;
    }

    try {
      addClient(form);
      setTouched({});
      setIsModalOpen(false);
      showSuccessAlert("Cliente registrado correctamente 🎉"); // ✅ Éxito
    } catch (error) {
      showErrorAlert("No se pudo registrar el cliente ❌"); // ✅ Error
    }
  };

  const handleBlur = (field) => setTouched({ ...touched, [field]: true });

  const handleEnter = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => setIsModalOpen(false)}
      ></div>

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="relative bg-white text-black rounded-xl shadow-lg p-6 w-full max-w-2xl z-10"
      >
        <h2 className="text-2xl font-semibold mb-6">Registrar Cliente</h2>

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
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onBlur={() => handleBlur("nombre")}
              onKeyDown={(e) => handleEnter(e, tipoRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.nombre && (
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
                setForm({ ...form, tipoDocumento: e.target.value })
              }
              onBlur={() => handleBlur("tipoDocumento")}
              onKeyDown={(e) => handleEnter(e, docRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black appearance-none ${
                errors.tipoDocumento ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione</option>
              {tipoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.tipoDocumento && (
              <p className="text-red-600 text-sm mt-1">
                {errors.tipoDocumento}
              </p>
            )}
          </div>

          {/* Documento */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              ref={docRef}
              type="text"
              placeholder="Ingrese número de documento"
              value={form.numeroDocumento}
              onChange={(e) =>
                setForm({
                  ...form,
                  numeroDocumento: e.target.value.replace(/\D/g, ""),
                })
              }
              onBlur={() => handleBlur("numeroDocumento")}
              onKeyDown={(e) => handleEnter(e, correoRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                errors.numeroDocumento ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.numeroDocumento && (
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
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              onBlur={() => handleBlur("correo")}
              onKeyDown={(e) => handleEnter(e, telefonoRef)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                errors.correo ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.correo && (
              <p className="text-red-600 text-sm mt-1">{errors.correo}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-medium">Número de Teléfono</label>
            <input
              ref={telefonoRef}
              type="text"
              placeholder="Ingrese número de teléfono"
              value={form.telefono}
              onChange={(e) =>
                setForm({
                  ...form,
                  telefono: e.target.value.replace(/\D/g, ""),
                })
              }
              onBlur={() => handleBlur("telefono")}
              onKeyDown={(e) => handleEnter(e, null)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 bg-white text-black ${
                errors.telefono ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.telefono && (
              <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Toggle Activo */}
          <div className="col-span-2 flex items-center gap-3 mt-2">
            <span className="font-medium text-black">Activo:</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, activo: !form.activo })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                form.activo ? "bg-green-500" : "bg-gray-300"
              }`}
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
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              disabled={Object.keys(errors).length > 0}
            >
              Registrar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
