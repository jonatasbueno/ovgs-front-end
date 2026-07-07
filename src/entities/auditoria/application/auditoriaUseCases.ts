import type { Auditoria } from "../model/auditoriaSchema";
import { auditoriaApi } from "../infrastructure/auditoriaApi";

export async function executeListarAuditorias(
  entidadeAfetada?: string,
): Promise<Auditoria[]> {
  return auditoriaApi.listar(entidadeAfetada);
}
