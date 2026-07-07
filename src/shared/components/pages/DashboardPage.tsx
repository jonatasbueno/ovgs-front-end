"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_ORDEM_VENDA,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import { useMonitoramentoOVs } from "@/features/monitoramento-operacional";
import { FiltrosMonitoramento } from "@/shared/components/molecules/FiltrosMonitoramento";
import { TabelaOVs } from "@/shared/components/organisms/TabelaOVs";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

/**
 * Painel de Monitoramento Operacional (home).
 * Visão consolidada das OVs com filtros combinados e re-fetch reativo.
 */
export function DashboardPage() {
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

  const contagemPorStatus = STATUS_ORDEM_VENDA.map((status) => ({
    status,
    total: ordens.filter((ov) => ov.status === status).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Monitoramento operacional
          </h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe o ciclo de vida das ordens de venda em tempo real.
          </p>
        </div>
        <Button asChild>
          <Link href="/ordens-venda/nova">
            <Plus className="size-4" />
            Nova OV
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {contagemPorStatus.map(({ status, total }) => (
          <Card key={status} className="py-4">
            <CardContent className="px-4">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {total}
              </p>
            </CardContent>
          </Card>
        ))}
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
