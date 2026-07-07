import { httpClient } from "@/shared/api/httpClient";
import type {
  CriarOrdemVendaInput,
  DadosAgendamento,
  FiltrosOrdemVenda,
  OrdemVenda,
} from "../model/ordemVendaSchema";
import type { StatusOrdemVenda } from "../model/statusOrdemVenda";

export const ordemVendaApi = {
  listar: async (filtros?: FiltrosOrdemVenda): Promise<OrdemVenda[]> => {
    const { data } = await httpClient.get<OrdemVenda[]>("/ordens-venda", {
      params: filtros,
    });
    return data;
  },

  buscarPorId: async (id: string): Promise<OrdemVenda> => {
    const { data } = await httpClient.get<OrdemVenda>(`/ordens-venda/${id}`);
    return data;
  },

  criar: async (input: CriarOrdemVendaInput): Promise<OrdemVenda> => {
    const { data } = await httpClient.post<OrdemVenda>("/ordens-venda", input);
    return data;
  },

  atualizarStatus: async (
    id: string,
    status: StatusOrdemVenda,
  ): Promise<OrdemVenda> => {
    const { data } = await httpClient.patch<OrdemVenda>(
      `/ordens-venda/${id}/status`,
      { status },
    );
    return data;
  },

  agendar: async (
    id: string,
    dadosAgendamento: DadosAgendamento,
  ): Promise<OrdemVenda> => {
    const { data } = await httpClient.patch<OrdemVenda>(
      `/ordens-venda/${id}/agendamento`,
      dadosAgendamento,
    );
    return data;
  },
};
