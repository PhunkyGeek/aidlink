// components/ui/FormInput.tsx
type FormInputProps = {
    type: string;
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  
  export default function FormInput({ type, value, placeholder, onChange }: FormInputProps) {
    return (
      <input
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
      />
    );
  }
  