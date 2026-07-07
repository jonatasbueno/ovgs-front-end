"use client";

import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

interface FormInputProps<T extends FieldValues> extends Omit<
  ComponentProps<typeof Input>,
  "name"
> {
  name: Path<T>;
  label: string;
  description?: string;
}

/**
 * Input integrado ao React Hook Form com mensagens de erro acessíveis
 * (aria-invalid + aria-describedby).
 */
export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  className,
  ...props
}: FormInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : description ? descriptionId : undefined
        }
        {...register(name)}
        {...props}
      />
      {description && !error && (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}
