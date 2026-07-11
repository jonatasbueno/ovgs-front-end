"use client";

import { useState } from "react";
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { addDays, format, parse, startOfDay } from "date-fns";
import { ptBR as ptBRDateFns } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { ptBR as ptBRDayPicker } from "react-day-picker/locale";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  minDate?: Date;
  className?: string;
}

interface FormDatePickerFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  dataMinima: Date;
  error?: string;
  className?: string;
}

function FormDatePickerField({
  id,
  label,
  placeholder,
  value,
  onChange,
  dataMinima,
  error,
  className,
}: FormDatePickerFieldProps) {
  const [aberto, setAberto] = useState(false);
  const errorId = `${id}-error`;
  const dataSelecionada = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            type="button"
            data-empty={!dataSelecionada}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground"
          >
            <CalendarIcon />
            {dataSelecionada
              ? format(dataSelecionada, "P", { locale: ptBRDateFns })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dataSelecionada}
            defaultMonth={dataSelecionada ?? dataMinima}
            disabled={{ before: dataMinima }}
            onSelect={(data) => {
              onChange(data ? format(data, "yyyy-MM-dd") : "");
              setAberto(false);
            }}
            locale={ptBRDayPicker}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Date picker integrado ao React Hook Form (Popover + Calendar shadcn).
 */
export function FormDatePicker<T extends FieldValues>({
  name,
  label,
  placeholder = "Selecionar",
  minDate,
  className,
}: FormDatePickerProps<T>) {
  const { control } = useFormContext<T>();
  const dataMinima = startOfDay(minDate ?? addDays(new Date(), 1));

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormDatePickerField
          id={String(name)}
          label={label}
          placeholder={placeholder}
          value={field.value ?? ""}
          onChange={field.onChange}
          dataMinima={dataMinima}
          error={fieldState.error?.message}
          className={className}
        />
      )}
    />
  );
}
