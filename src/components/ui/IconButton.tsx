// components/ui/IconButton.tsx
import { ReactNode } from "react";

type IconButtonProps = {
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
};

export default function IconButton({
  onClick,
  children,
  ariaLabel,
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`p-2 rounded border transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
