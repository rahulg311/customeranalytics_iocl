import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const SelectBox = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);
  return (
    <div className="relative w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>

      {/* Selected box */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between bg-white border border-gray-300
                   rounded-xl px-4 py-2.5 cursor-pointer
                   shadow-sm hover:border-blue-400 transition"
      >
        <span className="text-gray-800">{selectedOption ? selectedOption.label : "Select"}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown options */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200
                        rounded-xl shadow-lg overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5
                          cursor-pointer transition
                          hover:bg-blue-50 ${
                            value === opt.id ? "bg-blue-100 text-blue-700 font-medium" : ""
                          }`}
            >
              {opt.label}
              {value === opt.id && <Check className="w-4 h-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectBox;
