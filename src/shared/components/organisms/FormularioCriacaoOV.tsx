"use client";

import { useMemo } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Cliente } from "@/entities/cliente/model/clienteSchema";
import { clienteAutorizaTransporte } from "@/entities/cliente/model/clienteSchema";
import type { TipoTransporte } from "@/entities/tipo-transporte/model/tipoTransporteSchema";
import type { Item } from "@/entities/item/model/itemSchema";
import type { CriarOrdemVendaInput } from "@/entities/ordem-venda/model/ordemVendaSchema";
import { buildCriarOrdemVendaFormSchema } from "@/entities/ordem-venda/model/criarOrdemVendaFormSchema";
import { FormSelect } from "@/shared/components/atoms/FormSelect";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface FormularioCriacaoOVProps {
  clientes: Cliente[];
  tiposTransporte: TipoTransporte[];
  itens: Item[];
  onSubmit: (input: CriarOrdemVendaInput) => void;
  enviando?: boolean;
}

/**
 * Formulário de criação de Ordem de Venda.
 *
 * Componente puramente presentacional: recebe os dados e o callback de
 * submissão de fora (páginas orquestram via hooks de features).
 * A validação cruzada cliente × transporte é feita pelo schema Zod e
 * reforçada visualmente desabilitando transportes não autorizados.
 */
export function FormularioCriacaoOV({
  clientes,
  tiposTransporte,
  itens,
  onSubmit,
  enviando = false,
}: FormularioCriacaoOVProps) {
  const schema = useMemo(
    () => buildCriarOrdemVendaFormSchema(clientes),
    [clientes],
  );

  const form = useForm<CriarOrdemVendaInput>({
    resolver: zodResolver(schema),
    defaultValues: { clienteId: "", tipoTransporteId: "", itensIds: [] },
    mode: "onChange",
  });

  const clienteId = useWatch({ control: form.control, name: "clienteId" });
  const clienteSelecionado = clientes.find((c) => c.id === clienteId);

  const opcoesTransporte = tiposTransporte.map((tipo) => ({
    value: tipo.id,
    label:
      clienteSelecionado &&
      !clienteAutorizaTransporte(clienteSelecionado, tipo.id)
        ? `${tipo.descricao} (não autorizado)`
        : tipo.descricao,
    disabled: clienteSelecionado
      ? !clienteAutorizaTransporte(clienteSelecionado, tipo.id)
      : false,
  }));

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Cliente e transporte</CardTitle>
            <CardDescription>
              O tipo de transporte precisa estar autorizado para o cliente
              selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormSelect<CriarOrdemVendaInput>
              name="clienteId"
              label="Cliente"
              placeholder="Selecione o cliente"
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            />
            <FormSelect<CriarOrdemVendaInput>
              name="tipoTransporteId"
              label="Tipo de transporte"
              placeholder="Selecione o transporte"
              options={opcoesTransporte}
              description={
                clienteSelecionado
                  ? undefined
                  : "Selecione um cliente para ver os transportes autorizados"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens da ordem</CardTitle>
            <CardDescription>Selecione ao menos um item.</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="itensIds"
              render={({ field, fieldState }) => (
                <fieldset
                  className="grid gap-2 sm:grid-cols-2"
                  aria-describedby={
                    fieldState.error ? "itensIds-error" : undefined
                  }
                >
                  <legend className="sr-only">Itens da ordem de venda</legend>
                  {itens.map((item) => {
                    const selecionado = field.value.includes(item.id);
                    return (
                      <Label
                        key={item.id}
                        className="hover:bg-accent has-checked:border-primary has-checked:bg-accent flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary mt-0.5 size-4"
                          checked={selecionado}
                          onChange={(e) =>
                            field.onChange(
                              e.target.checked
                                ? [...field.value, item.id]
                                : field.value.filter((id) => id !== item.id),
                            )
                          }
                        />
                        <span className="grid gap-0.5">
                          <span className="text-sm font-medium">
                            {item.descricao}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {[
                              item.pesoKg ? `${item.pesoKg} kg` : null,
                              item.volumeM3 ? `${item.volumeM3} m³` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Sem medidas cadastradas"}
                          </span>
                        </span>
                      </Label>
                    );
                  })}
                  {fieldState.error && (
                    <p
                      id="itensIds-error"
                      role="alert"
                      className="text-destructive text-sm sm:col-span-2"
                    >
                      {fieldState.error.message}
                    </p>
                  )}
                </fieldset>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={enviando}>
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Criar ordem de venda
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
