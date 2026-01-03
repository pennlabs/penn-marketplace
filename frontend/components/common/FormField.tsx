import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  optional?: boolean;
  helperText?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  touched = false,
  required = false,
  optional = false,
  helperText,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">
        {label}
        {optional && (
          <span className="text-gray-400 font-normal"> (optional)</span>
        )}
      </label>
      {children}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      {error && touched && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

