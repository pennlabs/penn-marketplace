import { FormField } from "@/components/common/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface FormSelectPropsBase {
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  touched?: boolean;
  optional?: boolean;
  helperText?: string;
}

type StringFormSelectProps = FormSelectPropsBase & {
  valueType?: "string";
  value: string | undefined;
  onChange: (value: string) => void;
};

type NumberFormSelectProps = FormSelectPropsBase & {
  valueType: "number";
  value: number | undefined;
  onChange: (value: number) => void;
};

type FormSelectProps = StringFormSelectProps | NumberFormSelectProps;

export const FormSelect = ({
  label,
  options,
  placeholder = "Select an option",
  error,
  touched,
  optional,
  helperText,
  valueType,
  value,
  onChange,
}: FormSelectProps) => {
  const stringValue = value !== undefined ? String(value) : "";

  const handleChange = (val: string) => {
    if (valueType === "number") {
      onChange(Number(val));
    } else {
      onChange(val);
    }
  };

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      optional={optional}
      helperText={helperText}
    >
      <Select value={stringValue} onValueChange={handleChange}>
        <SelectTrigger className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
};
