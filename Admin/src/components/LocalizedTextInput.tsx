import React from 'react';
import { FiGlobe } from 'react-icons/fi';

interface LocalizedTextInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'number';
}

const LocalizedTextInput: React.FC<LocalizedTextInputProps> = ({
  value,
  onChange,
  placeholder = 'Digite o texto',
  label,
  disabled = false,
  className = '',
  type = 'text'
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => {
            const val = type === 'number' ? Number(e.target.value) : e.target.value;
            onChange(val);
          }}
          disabled={disabled}
          className="w-full px-3 py-2 pr-20 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-lg">🇧🇷</span>
          <button 
            type="button"
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Alternar idioma"
            disabled={disabled}
          >
            <FiGlobe size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalizedTextInput;
