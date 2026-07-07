"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useClientes } from "@/entities/cliente";
import { useTiposTransporte } from "@/entities/tipo-transporte";
import { useItens } from "@/entities/item";
import { useCriacaoOV } from "@/features/gestao-ovs";
import { FormularioCriacaoOV } from "@/shared/components/organisms/FormularioCriacaoOV";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

/** Criação de uma nova Ordem de Venda. */
export function NovaOrdemVendaPage() {
  const clientesQuery = useClientes();
  const transportesQuery = useTiposTransporte();
  const itensQuery = useItens();
  const { criar, enviando } = useCriacaoOV();

  const carregando =
    clientesQuery.isLoading ||
    transportesQuery.isLoading ||
    itensQuery.isLoading;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/ordens-venda">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nova ordem de venda
        </h1>
        <p className="text-muted-foreground text-sm">
          A OV será criada no status inicial do fluxo (Criada).
        </p>
      </div>

      {carregando ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <FormularioCriacaoOV
          clientes={clientesQuery.data ?? []}
          tiposTransporte={transportesQuery.data ?? []}
          itens={itensQuery.data ?? []}
          onSubmit={criar}
          enviando={enviando}
        />
      )}
    </div>
  );
}
