import {
  criarTipoTransporteSchema,
  type CriarTipoTransporteInput,
  type TipoTransporte,
} from "../model/tipoTransporteSchema";
import { tipoTransporteApi } from "../infrastructure/tipoTransporteApi";

export async function executeListarTiposTransporte(): Promise<
  TipoTransporte[]
> {
  return tipoTransporteApi.listar();
}

export async function executeCriarTipoTransporte(
  input: CriarTipoTransporteInput,
): Promise<TipoTransporte> {
  const parsed = criarTipoTransporteSchema.parse(input);
  return tipoTransporteApi.criar(parsed);
}
