import {
  clienteAutorizaTransporte,
  type Cliente,
} from "@/entities/cliente/model/clienteSchema";
import { clienteApi } from "@/entities/cliente/infrastructure/clienteApi";
import {
  criarOrdemVendaSchema,
  dadosAgendamentoSchema,
  type CriarOrdemVendaInput,
  type DadosAgendamento,
  type FiltrosOrdemVenda,
  type OrdemVenda,
} from "../model/ordemVendaSchema";
import {
  validarTransicaoStatus,
  type StatusOrdemVenda,
} from "../model/statusOrdemVenda";
import { ordemVendaApi } from "../infrastructure/ordemVendaApi";

export class TransporteNaoAutorizadoError extends Error {
  constructor(clienteNome: string) {
    super(
      `O tipo de transporte selecionado não está autorizado para o cliente ${clienteNome}.`,
    );
    this.name = "TransporteNaoAutorizadoError";
  }
}

/**
 * Dependências injetáveis do caso de uso, permitindo testes unitários
 * sem tocar na camada de infraestrutura real.
 */
export interface CriarOrdemVendaDeps {
  buscarCliente: (id: string) => Promise<Cliente>;
  criarOrdemVenda: (input: CriarOrdemVendaInput) => Promise<OrdemVenda>;
}

const defaultDeps: CriarOrdemVendaDeps = {
  buscarCliente: clienteApi.buscarPorId,
  criarOrdemVenda: ordemVendaApi.criar,
};

/**
 * Cria uma OV garantindo as invariantes de domínio:
 * - exatamente um cliente e um tipo de transporte, ao menos um item (Zod);
 * - o transporte precisa estar autorizado para o cliente (validação cruzada).
 */
export async function executeCriarOrdemVenda(
  input: CriarOrdemVendaInput,
  deps: CriarOrdemVendaDeps = defaultDeps,
): Promise<OrdemVenda> {
  const parsed = criarOrdemVendaSchema.parse(input);

  const cliente = await deps.buscarCliente(parsed.clienteId);
  if (!clienteAutorizaTransporte(cliente, parsed.tipoTransporteId)) {
    throw new TransporteNaoAutorizadoError(cliente.nome);
  }

  return deps.criarOrdemVenda(parsed);
}

export async function executeListarOrdensVenda(
  filtros?: FiltrosOrdemVenda,
): Promise<OrdemVenda[]> {
  return ordemVendaApi.listar(filtros);
}

export async function executeBuscarOrdemVenda(id: string): Promise<OrdemVenda> {
  return ordemVendaApi.buscarPorId(id);
}

/**
 * Avança o status da OV validando a transição no domínio antes
 * de chamar a API (que valida novamente no "back-end" mockado).
 */
export async function executeAvancarStatus(
  ordem: Pick<OrdemVenda, "id" | "status">,
  novoStatus: StatusOrdemVenda,
): Promise<OrdemVenda> {
  validarTransicaoStatus(ordem.status, novoStatus);
  return ordemVendaApi.atualizarStatus(ordem.id, novoStatus);
}

/**
 * Define (ou redefine) os dados de agendamento de uma OV.
 * O mock transiciona PLANEJADA → AGENDADA no primeiro agendamento
 * e registra auditoria de reagendamento nos seguintes.
 */
export async function executeAgendarEntrega(
  id: string,
  dados: DadosAgendamento,
): Promise<OrdemVenda> {
  const parsed = dadosAgendamentoSchema.parse(dados);
  return ordemVendaApi.agendar(id, parsed);
}
