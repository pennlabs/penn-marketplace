import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  optional?: boolean;
  helperText?: string;
  /** Rendered next to the label (e.g. info icon with hover message) */
  labelSupplement?: ReactNode;
  children: ReactNode;
}

export const FormField = ({
  label,
  error,
  touched = false,
  optional = false,
  helperText,
  labelSupplement,
  children,
}: FormFieldProps) => {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
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
