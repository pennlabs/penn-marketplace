import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  touched?: boolean;
  optional?: boolean;
  helperText?: string;
  labelSupplement?: ReactNode;
  children: ReactNode;
}

export const FormField = ({
  label,
  htmlFor,
  error,
  touched = false,
  optional = false,
  helperText,
  labelSupplement,
  children,
}: FormFieldProps) => {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1.5 text-sm font-medium">
        <span>
          {label}
          {optional && <span className="font-normal text-gray-400"> (optional)</span>}
        </span>
        {labelSupplement}
      </label>
      {children}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      {error && touched && <p className="text-destructive mt-1 text-sm">{error}</p>}
    </div>
  );
};
