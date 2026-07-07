"use client";

import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import {
  criarClienteSchema,
  type Cliente,
  type CriarClienteInput,
} from "@/entities/cliente";
import { useCadastroClientes } from "@/features/cadastros";
import { FormInput } from "@/shared/components/atoms/FormInput";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

/** CRUD de clientes: listagem, criação e edição. */
export function ClientesPage() {
  const { clientes, tiposTransporte, carregando, criar, atualizar, enviando } =
    useCadastroClientes();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null);

  const form = useForm<CriarClienteInput>({
    resolver: zodResolver(criarClienteSchema),
    defaultValues: { nome: "", transportesAutorizadosIds: [] },
  });

  const abrirCriacao = () => {
    setClienteEmEdicao(null);
    form.reset({ nome: "", transportesAutorizadosIds: [] });
    setDialogAberto(true);
  };

  const abrirEdicao = (cliente: Cliente) => {
    setClienteEmEdicao(cliente);
    form.reset({
      nome: cliente.nome,
      transportesAutorizadosIds: cliente.transportesAutorizadosIds,
    });
    setDialogAberto(true);
  };

  const onSubmit = (input: CriarClienteInput) => {
    const fechar = () => setDialogAberto(false);
    if (clienteEmEdicao) {
      atualizar(clienteEmEdicao.id, input, fechar);
    } else {
      criar(input, fechar);
    }
  };

  const nomeTransporte = (id: string) =>
    tiposTransporte.find((t) => t.id === id)?.descricao ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Cada cliente define quais tipos de transporte aceita receber.
          </p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus className="size-4" />
          Novo cliente
        </Button>
      </div>

      {carregando ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Transportes autorizados</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cliente.transportesAutorizadosIds.map((id) => (
                        <Badge key={id} variant="secondary">
                          {nomeTransporte(id)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => abrirEdicao(cliente)}
                      aria-label={`Editar cliente ${cliente.nome}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {clienteEmEdicao ? "Editar cliente" : "Novo cliente"}
            </DialogTitle>
            <DialogDescription>
              Selecione os tipos de transporte autorizados para este cliente.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="grid gap-4"
            >
              <FormInput<CriarClienteInput> name="nome" label="Nome" />
              <Controller
                control={form.control}
                name="transportesAutorizadosIds"
                render={({ field, fieldState }) => (
                  <fieldset className="grid gap-2">
                    <legend className="mb-1 text-sm font-medium">
                      Transportes autorizados
                    </legend>
                    {tiposTransporte.map((tipo) => (
                      <Label
                        key={tipo.id}
                        className="flex cursor-pointer items-center gap-2 font-normal"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary size-4"
                          checked={field.value.includes(tipo.id)}
                          onChange={(e) =>
                            field.onChange(
                              e.target.checked
                                ? [...field.value, tipo.id]
                                : field.value.filter((id) => id !== tipo.id),
                            )
                          }
                        />
                        {tipo.descricao}
                      </Label>
                    ))}
                    {fieldState.error && (
                      <p role="alert" className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </fieldset>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando && <Loader2 className="size-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
