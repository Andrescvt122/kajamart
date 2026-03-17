import { useState, useCallback } from "react";

export const useFormValidation = (validationRules) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const error = validate(name, value);
    
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return { name, value, error };
  }, [validate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const validateAll = useCallback((formData) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach((field) => {
      const error = validate(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validate, validationRules]);

  return {
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    validateAll,
    setTouched,
    setErrors,
  };
};
