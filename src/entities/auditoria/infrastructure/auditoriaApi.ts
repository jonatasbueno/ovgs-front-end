import { httpClient } from "@/shared/api/httpClient";
import type { Auditoria } from "../model/auditoriaSchema";

export const auditoriaApi = {
  listar: async (entidadeAfetada?: string): Promise<Auditoria[]> => {
    const { data } = await httpClient.get<Auditoria[]>("/auditorias", {
      params: entidadeAfetada ? { entidadeAfetada } : undefined,
    });
    return data;
  },
};
