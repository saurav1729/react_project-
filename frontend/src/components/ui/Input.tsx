import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | boolean;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                {label}
            </label>
            <input
                className={`
          w-full px-4 py-2.5 rounded-lg border bg-white/50 backdrop-blur-sm
          focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 
          transition-all duration-200 outline-none
          placeholder:text-gray-400 text-gray-900
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
                {...props}
            />
            {error && typeof error === 'string' && (
                <p className="mt-1 text-xs font-semibold text-red-500 ml-1 animate-fadeIn">{error}</p>
            )}
        </div>
    );
};

export default Input;
