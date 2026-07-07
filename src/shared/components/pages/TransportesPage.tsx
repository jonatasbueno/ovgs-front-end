"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import {
  criarTipoTransporteSchema,
  type CriarTipoTransporteInput,
} from "@/entities/tipo-transporte";
import { useCadastroTransportes } from "@/features/cadastros";
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

/** Cadastro simplificado de tipos de transporte. */
export function TransportesPage() {
  const { tiposTransporte, carregando, criar, enviando } =
    useCadastroTransportes();

  const form = useForm<CriarTipoTransporteInput>({
    resolver: zodResolver(criarTipoTransporteSchema),
    defaultValues: { descricao: "" },
  });

  const onSubmit = (input: CriarTipoTransporteInput) => {
    criar(input, () => form.reset({ descricao: "" }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tipos de transporte
        </h1>
        <p className="text-muted-foreground text-sm">
          Cadastro escalável de modalidades de transporte.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nova modalidade</CardTitle>
            <CardDescription>Ex: Caminhão, Carreta, Bi-truck…</CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="grid gap-4"
              >
                <FormInput<CriarTipoTransporteInput>
                  name="descricao"
                  label="Descrição"
                  placeholder="Ex: Caminhão baú"
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
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposTransporte.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell className="font-medium">
                      {tipo.descricao}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-xs">
                      {tipo.id.slice(-8).toUpperCase()}
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
