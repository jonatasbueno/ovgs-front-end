"use client";

import {
  useAtualizarCliente,
  useClientes,
  useCriarCliente,
  type AtualizarClienteInput,
  type CriarClienteInput,
} from "@/entities/cliente";
import { useTiposTransporte } from "@/entities/tipo-transporte";
import { toast } from "@/shared/adapters/toast";
import { extractApiError } from "@/shared/api/httpClient";

/** Feature: CRUD de clientes com feedback ao usuário. */
export function useCadastroClientes() {
  const clientesQuery = useClientes();
  const transportesQuery = useTiposTransporte();
  const criarMutation = useCriarCliente();
  const atualizarMutation = useAtualizarCliente();

  const criar = (input: CriarClienteInput, onSuccess?: () => void) => {
    criarMutation.mutate(input, {
      onSuccess: () => {
        toast.success("Cliente criado com sucesso");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          "Não foi possível criar o cliente",
          extractApiError(error).message,
        );
      },
    });
  };

  const atualizar = (
    id: string,
    input: AtualizarClienteInput,
    onSuccess?: () => void,
  ) => {
    atualizarMutation.mutate(
      { id, input },
      {
        onSuccess: () => {
          toast.success("Cliente atualizado com sucesso");
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(
            "Não foi possível atualizar o cliente",
            extractApiError(error).message,
          );
        },
      },
    );
  };

  return {
    clientes: clientesQuery.data ?? [],
    tiposTransporte: transportesQuery.data ?? [],
    carregando: clientesQuery.isLoading,
    criar,
    atualizar,
    enviando: criarMutation.isPending || atualizarMutation.isPending,
  };
}
