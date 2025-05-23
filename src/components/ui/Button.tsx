// src/components/ui/Button.tsx
import { ReactNode } from 'react';

type ButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'default' | 'outline';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean; // Add this line
  };
  
  export function Button({
    children,
    onClick,
    className = '',
    variant = 'default',
    type = 'button',
    disabled = false, // Add this line
  }: ButtonProps) {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed';
    const variantClasses = variant === 'outline'
      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
      : 'bg-gray-700 text-white hover:bg-gray-600';
  
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled} // Add this line
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {children}
      </button>
    );
  }