import { httpClient } from "@/shared/api/httpClient";
import type {
  CriarTipoTransporteInput,
  TipoTransporte,
} from "../model/tipoTransporteSchema";

export const tipoTransporteApi = {
  listar: async (): Promise<TipoTransporte[]> => {
    const { data } =
      await httpClient.get<TipoTransporte[]>("/tipos-transporte");
    return data;
  },

  criar: async (input: CriarTipoTransporteInput): Promise<TipoTransporte> => {
    const { data } = await httpClient.post<TipoTransporte>(
      "/tipos-transporte",
      input,
    );
    return data;
  },
};
