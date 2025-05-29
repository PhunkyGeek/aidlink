import React from 'react';

interface FormInputProps {
  type: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function FormInput({ type, value, placeholder, onChange, className }: FormInputProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      required
      className={`w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400/20 ${className || ''}`}
    />
  );
}