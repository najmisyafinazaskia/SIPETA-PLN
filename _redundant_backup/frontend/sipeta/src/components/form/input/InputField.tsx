import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export default function InputField({ className = "", ...props }: InputProps) {
    return (
        <input
            className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500 transition-all ${className}`}
            {...props}
        />
    );
}
