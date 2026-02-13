import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/common/FormField";

interface Option {
  value: string;
  label: string;
}

type FormSelectPropsBase = {
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  optional?: boolean;
  helperText?: string;
};

type StringFormSelectProps = FormSelectPropsBase & {
  value: string | undefined;
  onChange: (value: string) => void;
  asNumber?: false;
};

type NumberFormSelectProps = FormSelectPropsBase & {
  value: number | undefined;
  onChange: (value: number) => void;
  asNumber: true;
};

type FormSelectProps = StringFormSelectProps | NumberFormSelectProps;

export function FormSelect(props: FormSelectProps) {
  const {
    label,
    options,
    placeholder = "Select an option",
    error,
    touched,
    optional,
    helperText,
  } = props;

  const stringValue = props.asNumber
    ? props.value !== undefined
      ? String(props.value)
      : ""
    : (props.value ?? "");

  const handleChange = (val: string) => {
    if (props.asNumber) {
      props.onChange(Number(val));
    } else {
      props.onChange(val);
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
}
