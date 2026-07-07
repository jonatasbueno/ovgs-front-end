"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  executeCriarTipoTransporte,
  executeListarTiposTransporte,
} from "../../application/tipoTransporteUseCases";

export const tipoTransporteKeys = {
  all: ["tipos-transporte"] as const,
};

export function useTiposTransporte() {
  return useQuery({
    queryKey: tipoTransporteKeys.all,
    queryFn: executeListarTiposTransporte,
  });
}

export function useCriarTipoTransporte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: executeCriarTipoTransporte,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoTransporteKeys.all });
    },
  });
}
