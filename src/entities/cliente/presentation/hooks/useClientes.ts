"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AtualizarClienteInput } from "../../model/clienteSchema";
import {
  executeAtualizarCliente,
  executeBuscarCliente,
  executeCriarCliente,
  executeListarClientes,
} from "../../application/clienteUseCases";

export const clienteKeys = {
  all: ["clientes"] as const,
  detail: (id: string) => ["clientes", id] as const,
};

export function useClientes() {
  return useQuery({
    queryKey: clienteKeys.all,
    queryFn: executeListarClientes,
  });
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: clienteKeys.detail(id ?? ""),
    queryFn: () => executeBuscarCliente(id as string),
    enabled: Boolean(id),
  });
}

export function useCriarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: executeCriarCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clienteKeys.all });
    },
  });
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AtualizarClienteInput }) =>
      executeAtualizarCliente(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clienteKeys.all });
    },
  });
}
