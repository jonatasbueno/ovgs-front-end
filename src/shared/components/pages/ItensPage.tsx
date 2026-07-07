"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { useCadastroItens } from "@/features/cadastros";
import { FormInput } from "@/shared/components/atoms/FormInput";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const numeroOpcional = z
  .string()
  .optional()
  .refine((v) => !v || Number(v.replace(",", ".")) > 0, {
    message: "Informe um número maior que zero",
  });

const itemFormSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  pesoKg: numeroOpcional,
  volumeM3: numeroOpcional,
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

function paraNumero(valor?: string): number | undefined {
  if (!valor) return undefined;
  return Number(valor.replace(",", "."));
}

/** Cadastro simplificado de itens (SKUs). */
export function ItensPage() {
  const { itens, carregando, criar, enviando } = useCadastroItens();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { descricao: "", pesoKg: "", volumeM3: "" },
  });

  const onSubmit = (valores: ItemFormValues) => {
    criar(
      {
        descricao: valores.descricao,
        pesoKg: paraNumero(valores.pesoKg),
        volumeM3: paraNumero(valores.volumeM3),
      },
      () => form.reset({ descricao: "", pesoKg: "", volumeM3: "" }),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Itens</h1>
        <p className="text-muted-foreground text-sm">
          Itens pré-cadastrados vinculáveis às ordens de venda.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Novo item</CardTitle>
            <CardDescription>
              Peso e volume são opcionais, mas enriquecem a visualização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="grid gap-4"
              >
                <FormInput<ItemFormValues>
                  name="descricao"
                  label="Descrição"
                  placeholder="Ex: Palete de bebidas"
                />
                <FormInput<ItemFormValues>
                  name="pesoKg"
                  label="Peso (kg)"
                  inputMode="decimal"
                  placeholder="Opcional"
                />
                <FormInput<ItemFormValues>
                  name="volumeM3"
                  label="Volume (m³)"
                  inputMode="decimal"
                  placeholder="Opcional"
                />
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Adicionar
                </Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        {carregando ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="h-fit rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead className="text-right">SKU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.descricao}
                    </TableCell>
                    <TableCell>
                      {item.pesoKg ? `${item.pesoKg} kg` : "—"}
                    </TableCell>
                    <TableCell>
                      {item.volumeM3 ? `${item.volumeM3} m³` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-xs">
                      {item.id.slice(-8).toUpperCase()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
