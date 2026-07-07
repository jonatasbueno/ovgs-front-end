import { httpClient } from "@/shared/api/httpClient";
import type {
  AtualizarClienteInput,
  Cliente,
  CriarClienteInput,
} from "../model/clienteSchema";

export const clienteApi = {
  listar: async (): Promise<Cliente[]> => {
    const { data } = await httpClient.get<Cliente[]>("/clientes");
    return data;
  },

  buscarPorId: async (id: string): Promise<Cliente> => {
    const { data } = await httpClient.get<Cliente>(`/clientes/${id}`);
    return data;
  },

  criar: async (input: CriarClienteInput): Promise<Cliente> => {
    const { data } = await httpClient.post<Cliente>("/clientes", input);
    return data;
  },

  atualizar: async (
    id: string,
    input: AtualizarClienteInput,
  ): Promise<Cliente> => {
    const { data } = await httpClient.put<Cliente>(`/clientes/${id}`, input);
    return data;
  },
};
