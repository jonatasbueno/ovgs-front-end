"use client";

import {
  useAgendarEntrega,
  type DadosAgendamento,
} from "@/entities/ordem-venda";
import { toast } from "@/shared/adapters/toast";
import { extractApiError } from "@/shared/api/httpClient";

/**
 * Feature: central de agendamento.
 *
 * Agendar transiciona a OV de PLANEJADA para AGENDADA;
 * reagendar mantém o status e gera evento de auditoria de reagendamento.
 */
export function useAgendamentoEntrega() {
  const mutation = useAgendarEntrega();

  const agendar = (
    id: string,
    dados: DadosAgendamento,
    opcoes?: { reagendamento?: boolean; onSuccess?: () => void },
  ) => {
    mutation.mutate(
      { id, dados },
      {
        onSuccess: () => {
          toast.success(
            opcoes?.reagendamento
              ? "Entrega reagendada com sucesso"
              : "Entrega agendada com sucesso",
          );
          opcoes?.onSuccess?.();
        },
        onError: (error) => {
          toast.error(
            "Não foi possível concluir o agendamento",
            extractApiError(error).message,
          );
        },
      },
    );
  };

  return { agendar, enviando: mutation.isPending };
}
