import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  optional?: boolean;
  helperText?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  touched = false,
  optional = false,
  helperText,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      {children}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      {error && touched && <p className="text-destructive mt-1 text-sm">{error}</p>}
    </div>
  );
}
