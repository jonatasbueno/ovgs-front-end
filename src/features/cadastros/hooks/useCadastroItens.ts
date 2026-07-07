"use client";

import { useCriarItem, useItens, type CriarItemInput } from "@/entities/item";
import { toast } from "@/shared/adapters/toast";
import { extractApiError } from "@/shared/api/httpClient";

/** Feature: cadastro simplificado de itens. */
export function useCadastroItens() {
  const query = useItens();
  const mutation = useCriarItem();

  const criar = (input: CriarItemInput, onSuccess?: () => void) => {
    mutation.mutate(input, {
      onSuccess: () => {
        toast.success("Item criado com sucesso");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          "Não foi possível criar o item",
          extractApiError(error).message,
        );
      },
    });
  };

  return {
    itens: query.data ?? [],
    carregando: query.isLoading,
    criar,
    enviando: mutation.isPending,
  };
}
