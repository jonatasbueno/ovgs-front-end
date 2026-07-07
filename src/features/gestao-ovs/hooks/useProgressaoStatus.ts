"use client";

import {
  proximoStatus,
  STATUS_LABELS,
  useAvancarStatus,
  type OrdemVenda,
} from "@/entities/ordem-venda";
import { toast } from "@/shared/adapters/toast";
import { extractApiError } from "@/shared/api/httpClient";

/**
 * Feature: progressão do fluxo de status de uma OV.
 *
 * Expõe apenas a transição válida seguinte — transições fora de ordem
 * são bloqueadas tanto aqui (UI) quanto no domínio e no mock da API.
 */
export function useProgressaoStatus(ordem: OrdemVenda | undefined) {
  const mutation = useAvancarStatus();

  const statusSeguinte = ordem ? proximoStatus(ordem.status) : null;

  /** Agendamento acontece pela Central de Agendamento, não pelo botão de avanço. */
  const avancoBloqueadoPorAgendamento =
    statusSeguinte === "AGENDADA" && !ordem?.dadosAgendamento;

  const avancar = () => {
    if (!ordem || !statusSeguinte) return;
    mutation.mutate(
      { ordem, novoStatus: statusSeguinte },
      {
        onSuccess: () => {
          toast.success(`OV movida para ${STATUS_LABELS[statusSeguinte]}`);
        },
        onError: (error) => {
          toast.error(
            "Não foi possível avançar o status",
            extractApiError(error).message,
          );
        },
      },
    );
  };

  return {
    statusSeguinte,
    avancoBloqueadoPorAgendamento,
    avancar,
    enviando: mutation.isPending,
  };
}
