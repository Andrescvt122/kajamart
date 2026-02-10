import { AlertCircle } from "lucide-react";

export const FormInputError = ({ error, touched, className = "" }) => {
  if (!error || !touched) return null;

  return (
    <div className={`flex items-center gap-1.5 mt-1.5 text-red-600 text-xs ${className}`}>
      <AlertCircle size={14} className="flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
};
