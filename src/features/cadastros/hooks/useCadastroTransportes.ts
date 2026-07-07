"use client";

import {
  useCriarTipoTransporte,
  useTiposTransporte,
  type CriarTipoTransporteInput,
} from "@/entities/tipo-transporte";
import { toast } from "@/shared/adapters/toast";
import { extractApiError } from "@/shared/api/httpClient";

/** Feature: cadastro simplificado de tipos de transporte. */
export function useCadastroTransportes() {
  const query = useTiposTransporte();
  const mutation = useCriarTipoTransporte();

  const criar = (input: CriarTipoTransporteInput, onSuccess?: () => void) => {
    mutation.mutate(input, {
      onSuccess: () => {
        toast.success("Tipo de transporte criado com sucesso");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          "Não foi possível criar o transporte",
          extractApiError(error).message,
        );
      },
    });
  };

  return {
    tiposTransporte: query.data ?? [],
    carregando: query.isLoading,
    criar,
    enviando: mutation.isPending,
  };
}
