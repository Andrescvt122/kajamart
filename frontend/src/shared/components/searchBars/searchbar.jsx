// src/shared/components/SearchBar.jsx
import { Search } from "lucide-react";

export default function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="relative w-full"> {/* ahora ocupa todo el ancho disponible */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={20} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder || "Buscar..."}
        value={value}
        onChange={onChange}
        className="pl-12 pr-4 py-2 w-full rounded-full border border-gray-300 bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
      />
    </div>
  );
}
