import React, { useState, useRef, useEffect } from 'react';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    value?: string;
    onChange: (value: string) => void;
    onClear?: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClear = () => {
        if (onClear) onClear();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-orange-600 ${value ? 'text-orange-600' : 'text-gray-500'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${value ? 'opacity-100' : 'opacity-70'}`}>
                    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {value && (
                            <button
                                onClick={handleClear}
                                className="block w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-gray-50 border-b border-gray-100"
                            >
                                Clear Filter
                            </button>
                        )}
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${value === option.value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
