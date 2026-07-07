import { z } from "zod";

export const TIPOS_ACAO_AUDITORIA = [
  "CRIACAO_OV",
  "ALTERACAO_STATUS",
  "AGENDAMENTO",
  "REAGENDAMENTO",
] as const;

export const tipoAcaoAuditoriaSchema = z.enum(TIPOS_ACAO_AUDITORIA);

export type TipoAcaoAuditoria = z.infer<typeof tipoAcaoAuditoriaSchema>;

export const TIPO_ACAO_LABELS: Record<TipoAcaoAuditoria, string> = {
  CRIACAO_OV: "Criação de OV",
  ALTERACAO_STATUS: "Alteração de status",
  AGENDAMENTO: "Agendamento",
  REAGENDAMENTO: "Reagendamento",
};

export const auditoriaSchema = z.object({
  id: z.uuid(),
  dataHora: z.string(),
  tipoAcao: tipoAcaoAuditoriaSchema,
  /** ID da entidade afetada (ex: id da OV) */
  entidadeAfetada: z.string(),
  estadoAnterior: z.record(z.string(), z.unknown()).optional(),
  estadoPosterior: z.record(z.string(), z.unknown()).optional(),
});

export type Auditoria = z.infer<typeof auditoriaSchema>;
