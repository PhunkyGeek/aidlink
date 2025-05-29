// src/components/ui/Spinner.tsx
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }
  
  export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };
  
    return (
      <div
        className={`animate-spin rounded-full border-2 border-current border-t-purple-700 ${sizeClasses[size]} ${className || ''}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }