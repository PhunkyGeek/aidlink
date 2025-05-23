// src/components/ui/Input.tsx
import { ChangeEventHandler } from 'react';

type InputProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
  type?: string;
};

export function Input({
  value,
  onChange,
  placeholder = '',
  className = '',
  type = 'text',
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 ${className}`}
    />
  );
}