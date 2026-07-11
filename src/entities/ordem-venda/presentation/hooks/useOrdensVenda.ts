"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CriarOrdemVendaInput,
  DadosAgendamento,
  FiltrosOrdemVenda,
  OrdemVenda,
} from "../../model/ordemVendaSchema";
import type { StatusOrdemVenda } from "../../model/statusOrdemVenda";
import {
  executeAgendarEntrega,
  executeAvancarStatus,
  executeBuscarOrdemVenda,
  executeCriarOrdemVenda,
  executeListarOrdensVenda,
} from "../../application/ordemVendaUseCases";
import { auditoriaKeys } from "@/entities/auditoria/presentation/hooks/useAuditorias";

export const ordemVendaKeys = {
  all: ["ordens-venda"] as const,
  list: (filtros?: FiltrosOrdemVenda) =>
    ["ordens-venda", "list", filtros ?? {}] as const,
  detail: (id: string) => ["ordens-venda", "detail", id] as const,
};

export function useOrdensVenda(filtros?: FiltrosOrdemVenda) {
  return useQuery({
    queryKey: ordemVendaKeys.list(filtros),
    queryFn: () => executeListarOrdensVenda(filtros),
  });
}

export function useOrdemVenda(id: string | undefined) {
  return useQuery({
    queryKey: ordemVendaKeys.detail(id ?? ""),
    queryFn: () => executeBuscarOrdemVenda(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidarOrdens() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ordemVendaKeys.all });
    queryClient.invalidateQueries({ queryKey: auditoriaKeys.all });
  };
}

function useAtualizarCacheOrdem() {
  const queryClient = useQueryClient();
  return (ordem: OrdemVenda) => {
    queryClient.setQueryData(ordemVendaKeys.detail(ordem.id), ordem);
    queryClient.setQueriesData<OrdemVenda[]>(
      {
        queryKey: ordemVendaKeys.all,
        predicate: (query) => query.queryKey[1] === "list",
      },
      (ordens) =>
        ordens?.map((ov) => (ov.id === ordem.id ? ordem : ov)) ?? ordens,
    );
  };
}

export function useCriarOrdemVenda() {
  const invalidar = useInvalidarOrdens();
  return useMutation({
    mutationFn: (input: CriarOrdemVendaInput) => executeCriarOrdemVenda(input),
    onSuccess: invalidar,
  });
}

export function useAvancarStatus() {
  const invalidar = useInvalidarOrdens();
  const atualizarCache = useAtualizarCacheOrdem();
  return useMutation({
    mutationFn: ({
      ordem,
      novoStatus,
    }: {
      ordem: Pick<OrdemVenda, "id" | "status">;
      novoStatus: StatusOrdemVenda;
    }) => executeAvancarStatus(ordem, novoStatus),
    onSuccess: (ordemAtualizada) => {
      atualizarCache(ordemAtualizada);
      invalidar();
    },
  });
}

export function useAgendarEntrega() {
  const invalidar = useInvalidarOrdens();
  const atualizarCache = useAtualizarCacheOrdem();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: DadosAgendamento }) =>
      executeAgendarEntrega(id, dados),
    onSuccess: (ordemAtualizada) => {
      atualizarCache(ordemAtualizada);
      invalidar();
    },
  });
}
