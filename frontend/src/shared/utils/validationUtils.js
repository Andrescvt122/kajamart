// Validadores básicos
export const validators = {
  required: (fieldName = "Este campo") => (value) => {
    if (!value || value.trim() === "") {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  minLength: (min, fieldName = "Este campo") => (value) => {
    if (value && value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  maxLength: (max, fieldName = "Este campo") => (value) => {
    if (value && value.length > max) {
      return `${fieldName} no puede exceder ${max} caracteres`;
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return "Correo electrónico inválido";
    }
    return null;
  },

  phone: (value) => {
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    if (value && !phoneRegex.test(value)) {
      return "Teléfono debe contener al menos 7 caracteres numéricos";
    }
    return null;
  },

  onlyLetters: (fieldName = "Este campo") => (value) => {
    const lettersRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]*$/;
    if (value && !lettersRegex.test(value)) {
      return `${fieldName} solo puede contener letras y espacios`;
    }
    return null;
  },

  documento: (value) => {
    // Validar que sea un número válido y tenga longitud razonable
    if (!value) return "Documento es requerido";
    
    const docRegex = /^[0-9]{6,20}$/;
    if (!docRegex.test(value.replace(/[.-]/g, ""))) {
      return "Documento debe contener entre 6 y 20 dígitos";
    }
    return null;
  },

  alphanumeric: (fieldName = "Este campo") => (value) => {
    const alphanumericRegex = /^[a-zA-Z0-9\s\-_.]*$/;
    if (value && !alphanumericRegex.test(value)) {
      return `${fieldName} solo puede contener letras, números y caracteres especiales (-, _, .)`;
    }
    return null;
  },
};
