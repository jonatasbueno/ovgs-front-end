import { format } from "date-fns";
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

export const JANELA_LABELS_CURTAS: Record<JanelaAtendimento, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};

export const dadosAgendamentoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  janela: janelaAtendimentoSchema,
});

export type DadosAgendamento = z.infer<typeof dadosAgendamentoSchema>;

/**
 * Na conclusão da entrega, se a data efetiva difere da agendada,
 * registra a data real mantendo a janela de atendimento.
 */
export function ajustarAgendamentoNaEntrega(
  dadosAgendamento: DadosAgendamento | undefined,
  dataEntrega: Date = new Date(),
): DadosAgendamento | undefined {
  if (!dadosAgendamento) return undefined;

  const dataEntregaIso = format(dataEntrega, "yyyy-MM-dd");
  if (dadosAgendamento.data === dataEntregaIso) return dadosAgendamento;

  return { ...dadosAgendamento, data: dataEntregaIso };
}

/** @deprecated Use ajustarAgendamentoNaEntrega */
export const ajustarAgendamentoSeEntregaAntecipada =
  ajustarAgendamentoNaEntrega;

export function resolverAgendamentoExibicao(
  ordem: Pick<OrdemVenda, "status" | "dadosAgendamento" | "entregueEm">,
): DadosAgendamento | undefined {
  if (!ordem.dadosAgendamento) return undefined;
  if (ordem.status !== "ENTREGUE" || !ordem.entregueEm) {
    return ordem.dadosAgendamento;
  }

  return (
    ajustarAgendamentoNaEntrega(
      ordem.dadosAgendamento,
      new Date(ordem.entregueEm),
    ) ?? ordem.dadosAgendamento
  );
}

export function formatarAgendamentoTexto(
  dados: DadosAgendamento,
  curta = false,
): string {
  const [ano, mes, dia] = dados.data.split("-");
  const janela = curta
    ? JANELA_LABELS_CURTAS[dados.janela]
    : JANELA_LABELS[dados.janela];
  return `${dia}/${mes}/${ano} · ${janela}`;
}

export function formatarAgendamentoOrdem(
  ordem: Pick<OrdemVenda, "status" | "dadosAgendamento" | "entregueEm">,
  curta = false,
): string {
  const dados = resolverAgendamentoExibicao(ordem);
  if (!dados) return "—";
  return formatarAgendamentoTexto(dados, curta);
}

export const ordemVendaSchema = z.object({
  id: z.uuid(),
  clienteId: z.uuid(),
  tipoTransporteId: z.uuid(),
  itensIds: z.array(z.uuid()).min(1, "Selecione ao menos um item"),
  status: statusOrdemVendaSchema,
  dadosAgendamento: dadosAgendamentoSchema.optional(),
  entregueEm: z.string().optional(),
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
