import { z } from "zod";

/**
 * Fluxo operacional estrito de uma Ordem de Venda.
 * A ordem do array define a única sequência válida de transições.
 */
export const STATUS_ORDEM_VENDA = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
] as const;

export const statusOrdemVendaSchema = z.enum(STATUS_ORDEM_VENDA);

export type StatusOrdemVenda = z.infer<typeof statusOrdemVendaSchema>;

export const STATUS_LABELS: Record<StatusOrdemVenda, string> = {
  CRIADA: "Criada",
  PLANEJADA: "Planejada",
  AGENDADA: "Agendada",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
};

export class TransicaoStatusInvalidaError extends Error {
  constructor(
    public readonly de: StatusOrdemVenda,
    public readonly para: StatusOrdemVenda,
  ) {
    super(
      `Transição de status inválida: ${STATUS_LABELS[de]} → ${STATUS_LABELS[para]}. ` +
        `O fluxo deve seguir a ordem ${STATUS_ORDEM_VENDA.join(" → ")}.`,
    );
    this.name = "TransicaoStatusInvalidaError";
  }
}

/**
 * Retorna o próximo status do fluxo, ou null se a OV já foi entregue.
 */
export function proximoStatus(
  atual: StatusOrdemVenda,
): StatusOrdemVenda | null {
  const indice = STATUS_ORDEM_VENDA.indexOf(atual);
  return STATUS_ORDEM_VENDA[indice + 1] ?? null;
}

/**
 * Uma transição só é válida para o status imediatamente seguinte no fluxo.
 * Não são permitidos saltos (ex: CRIADA → AGENDADA) nem retrocessos.
 */
export function podeTransicionar(
  de: StatusOrdemVenda,
  para: StatusOrdemVenda,
): boolean {
  return proximoStatus(de) === para;
}

/**
 * Valida uma transição de status, lançando erro de domínio se for inválida.
 */
export function validarTransicaoStatus(
  de: StatusOrdemVenda,
  para: StatusOrdemVenda,
): void {
  if (!podeTransicionar(de, para)) {
    throw new TransicaoStatusInvalidaError(de, para);
  }
}
