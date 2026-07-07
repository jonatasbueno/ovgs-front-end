import { z } from "zod";
import { statusOrdemVendaSchema } from "./statusOrdemVenda";

export const JANELAS_ATENDIMENTO = ["MANHA", "TARDE", "NOITE"] as const;

export const janelaAtendimentoSchema = z.enum(JANELAS_ATENDIMENTO);

export type JanelaAtendimento = z.infer<typeof janelaAtendimentoSchema>;

export const JANELA_LABELS: Record<JanelaAtendimento, string> = {
  MANHA: "Manhã (08h–12h)",
  TARDE: "Tarde (12h–18h)",
  NOITE: "Noite (18h–22h)",
};

export const dadosAgendamentoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  janela: janelaAtendimentoSchema,
});

export type DadosAgendamento = z.infer<typeof dadosAgendamentoSchema>;

export const ordemVendaSchema = z.object({
  id: z.uuid(),
  clienteId: z.uuid(),
  tipoTransporteId: z.uuid(),
  itensIds: z.array(z.uuid()).min(1, "Selecione ao menos um item"),
  status: statusOrdemVendaSchema,
  dadosAgendamento: dadosAgendamentoSchema.optional(),
  criadaEm: z.string(),
});

export const criarOrdemVendaSchema = z.object({
  clienteId: z.uuid("Selecione um cliente"),
  tipoTransporteId: z.uuid("Selecione um tipo de transporte"),
  itensIds: z.array(z.uuid()).min(1, "Selecione ao menos um item"),
});

export type OrdemVenda = z.infer<typeof ordemVendaSchema>;
export type CriarOrdemVendaInput = z.infer<typeof criarOrdemVendaSchema>;

export interface FiltrosOrdemVenda {
  status?: string;
  clienteId?: string;
  tipoTransporteId?: string;
  data?: string;
}
