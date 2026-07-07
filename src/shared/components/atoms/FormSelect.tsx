"use client";

import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Select integrado ao React Hook Form (via Controller) com
 * mensagens de erro acessíveis.
 */
export function FormSelect<T extends FieldValues>({
  name,
  label,
  placeholder = "Selecione...",
  options,
  description,
  disabled,
  className,
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>();
  const errorId = `${name}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("grid gap-2", className)}>
          <Label htmlFor={name}>{label}</Label>
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className="w-full"
              aria-invalid={Boolean(fieldState.error)}
              aria-describedby={fieldState.error ? errorId : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !fieldState.error && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          {fieldState.error && (
            <p id={errorId} role="alert" className="text-destructive text-sm">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
