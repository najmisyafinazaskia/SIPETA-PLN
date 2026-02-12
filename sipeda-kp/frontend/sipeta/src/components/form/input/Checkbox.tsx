import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function Checkbox({ checked, onChange, disabled, className = "" }: CheckboxProps) {
    return (
        <label className={`relative flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className="w-5 h-5 bg-gray-100 border-2 border-gray-200 rounded-md peer dark:bg-gray-800 dark:border-gray-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                <svg
                    className={`w-3.5 h-3.5 text-white transform transition-transform ${checked ? "scale-100" : "scale-0"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </label>
    );
}
