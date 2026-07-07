"use client";

import { useRouter } from "next/navigation";
import { useCriarOrdemVenda } from "@/entities/ordem-venda";
import type { CriarOrdemVendaInput } from "@/entities/ordem-venda";
import { toast } from "@/shared/adapters/toast";
import { extractApiError } from "@/shared/api/httpClient";

/**
 * Feature: criação de Ordem de Venda.
 * Orquestra a mutação, o feedback ao usuário e o redirecionamento
 * para a tela de acompanhamento da OV criada.
 */
export function useCriacaoOV() {
  const router = useRouter();
  const mutation = useCriarOrdemVenda();

  const criar = (input: CriarOrdemVendaInput) => {
    mutation.mutate(input, {
      onSuccess: (ordem) => {
        toast.success("Ordem de venda criada com sucesso");
        router.push(`/ordens-venda/${ordem.id}`);
      },
      onError: (error) => {
        toast.error(
          "Não foi possível criar a OV",
          extractApiError(error).message,
        );
      },
    });
  };

  return { criar, enviando: mutation.isPending };
}
