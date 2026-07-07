"use client";

import { useMemo } from "react";
import { useClientes } from "@/entities/cliente";
import { useTiposTransporte } from "@/entities/tipo-transporte";
import { useOrdensVenda } from "@/entities/ordem-venda";
import { useFiltrosMonitoramentoStore } from "@/shared/stores/filtrosMonitoramentoStore";

/**
 * Feature: painel de monitoramento operacional.
 *
 * Combina os filtros globais (Zustand) com as queries do TanStack Query.
 * Como os filtros fazem parte da queryKey, qualquer mudança dispara
 * re-fetch reativo automaticamente.
 */
export function useMonitoramentoOVs() {
  const { filtros, setFiltro, limparFiltros } = useFiltrosMonitoramentoStore();

  const ordensQuery = useOrdensVenda(filtros);
  const clientesQuery = useClientes();
  const transportesQuery = useTiposTransporte();

  const nomesClientes = useMemo(
    () =>
      Object.fromEntries((clientesQuery.data ?? []).map((c) => [c.id, c.nome])),
    [clientesQuery.data],
  );

  const nomesTransportes = useMemo(
    () =>
      Object.fromEntries(
        (transportesQuery.data ?? []).map((t) => [t.id, t.descricao]),
      ),
    [transportesQuery.data],
  );

  return {
    filtros,
    setFiltro,
    limparFiltros,
    ordens: ordensQuery.data ?? [],
    clientes: clientesQuery.data ?? [],
    tiposTransporte: transportesQuery.data ?? [],
    nomesClientes,
    nomesTransportes,
    carregando: ordensQuery.isLoading,
  };
}
