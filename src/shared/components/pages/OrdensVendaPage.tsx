"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMonitoramentoOVs } from "@/features/monitoramento-operacional";
import { FiltrosMonitoramento } from "@/shared/components/molecules/FiltrosMonitoramento";
import { TabelaOVs } from "@/shared/components/organisms/TabelaOVs";
import { Button } from "@/shared/components/ui/button";

/** Listagem de Ordens de Venda. */
export function OrdensVendaPage() {
  const {
    filtros,
    setFiltro,
    limparFiltros,
    ordens,
    clientes,
    tiposTransporte,
    nomesClientes,
    nomesTransportes,
    carregando,
  } = useMonitoramentoOVs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ordens de venda
          </h1>
          <p className="text-muted-foreground text-sm">
            {ordens.length} ordem(ns) encontrada(s).
          </p>
        </div>
        <Button asChild>
          <Link href="/ordens-venda/nova">
            <Plus className="size-4" />
            Nova OV
          </Link>
        </Button>
      </div>

      <FiltrosMonitoramento
        filtros={filtros}
        clientes={clientes}
        tiposTransporte={tiposTransporte}
        onFiltroChange={setFiltro}
        onLimpar={limparFiltros}
      />

      <TabelaOVs
        ordens={ordens}
        nomesClientes={nomesClientes}
        nomesTransportes={nomesTransportes}
        carregando={carregando}
      />
    </div>
  );
}
