"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  executeCriarItem,
  executeListarItens,
} from "../../application/itemUseCases";

export const itemKeys = {
  all: ["itens"] as const,
};

export function useItens() {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: executeListarItens,
  });
}

export function useCriarItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: executeCriarItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
