import { http, HttpResponse } from "msw";
import type {
  CriarClienteInput,
  AtualizarClienteInput,
} from "@/entities/cliente/model/clienteSchema";
import { clienteAutorizaTransporte } from "@/entities/cliente/model/clienteSchema";
import type { CriarTipoTransporteInput } from "@/entities/tipo-transporte/model/tipoTransporteSchema";
import type { CriarItemInput } from "@/entities/item/model/itemSchema";
import type {
  CriarOrdemVendaInput,
  DadosAgendamento,
  OrdemVenda,
} from "@/entities/ordem-venda/model/ordemVendaSchema";
import {
  podeTransicionar,
  STATUS_LABELS,
  type StatusOrdemVenda,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import type {
  Auditoria,
  TipoAcaoAuditoria,
} from "@/entities/auditoria/model/auditoriaSchema";
import { getDb, persistir } from "./db";

/** Prefixo com wildcard para funcionar tanto no browser quanto em Node (testes). */
const API = "*/api/v1";

function uuid(): string {
  return globalThis.crypto.randomUUID();
}

function registrarAuditoria(
  tipoAcao: TipoAcaoAuditoria,
  entidadeAfetada: string,
  estadoAnterior?: Record<string, unknown>,
  estadoPosterior?: Record<string, unknown>,
): void {
  const db = getDb();
  const auditoria: Auditoria = {
    id: uuid(),
    dataHora: new Date().toISOString(),
    tipoAcao,
    entidadeAfetada,
    estadoAnterior,
    estadoPosterior,
  };

  db.auditorias.push(auditoria);
  persistir();
}

function erro(status: number, message: string) {
  return HttpResponse.json({ message }, { status });
}

export const handlers = [
  // ── Clientes ─────────────────────────────────────────────────────────
  http.get(`${API}/clientes`, () => {
    return HttpResponse.json(getDb().clientes);
  }),

  http.get(`${API}/clientes/:id`, ({ params }) => {
    const cliente = getDb().clientes.find((c) => c.id === params.id);
    if (!cliente) return erro(404, "Cliente não encontrado");

    return HttpResponse.json(cliente);
  }),

  http.post(`${API}/clientes`, async ({ request }) => {
    const input = (await request.json()) as CriarClienteInput;
    const db = getDb();
    const cliente = { id: uuid(), ...input };

    db.clientes.push(cliente);
    persistir();

    return HttpResponse.json(cliente, { status: 201 });
  }),

  http.put(`${API}/clientes/:id`, async ({ params, request }) => {
    const input = (await request.json()) as AtualizarClienteInput;
    const db = getDb();
    const cliente = db.clientes.find((c) => c.id === params.id);

    if (!cliente) return erro(404, "Cliente não encontrado");

    Object.assign(cliente, input);
    persistir();

    return HttpResponse.json(cliente);
  }),

  // ── Tipos de transporte ────────────────────────────────────────────────
  http.get(`${API}/tipos-transporte`, () => {
    return HttpResponse.json(getDb().tiposTransporte);
  }),

  http.post(`${API}/tipos-transporte`, async ({ request }) => {
    const input = (await request.json()) as CriarTipoTransporteInput;
    const db = getDb();
    const tipo = { id: uuid(), ...input };

    db.tiposTransporte.push(tipo);
    persistir();

    return HttpResponse.json(tipo, { status: 201 });
  }),

  // ── Itens ──────────────────────────────────────────────────────────────
  http.get(`${API}/itens`, () => {
    return HttpResponse.json(getDb().itens);
  }),

  http.post(`${API}/itens`, async ({ request }) => {
    const input = (await request.json()) as CriarItemInput;
    const db = getDb();
    const item = { id: uuid(), ...input };

    db.itens.push(item);
    persistir();

    return HttpResponse.json(item, { status: 201 });
  }),

  // ── Ordens de venda ────────────────────────────────────────────────────
  http.get(`${API}/ordens-venda`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const clienteId = url.searchParams.get("clienteId");
    const tipoTransporteId = url.searchParams.get("tipoTransporteId");
    const data = url.searchParams.get("data");
    let ordens = [...getDb().ordensVenda];

    if (status) ordens = ordens.filter((ov) => ov.status === status);
    if (clienteId) ordens = ordens.filter((ov) => ov.clienteId === clienteId);
    if (tipoTransporteId)
      ordens = ordens.filter((ov) => ov.tipoTransporteId === tipoTransporteId);
    if (data)
      ordens = ordens.filter(
        (ov) =>
          ov.dadosAgendamento?.data === data || ov.criadaEm.startsWith(data),
      );

    ordens.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));

    return HttpResponse.json(ordens);
  }),

  http.get(`${API}/ordens-venda/:id`, ({ params }) => {
    const ordem = getDb().ordensVenda.find((ov) => ov.id === params.id);

    if (!ordem) return erro(404, "Ordem de venda não encontrada");

    return HttpResponse.json(ordem);
  }),

  http.post(`${API}/ordens-venda`, async ({ request }) => {
    const input = (await request.json()) as CriarOrdemVendaInput;
    const db = getDb();
    const cliente = db.clientes.find((c) => c.id === input.clienteId);

    if (!cliente) return erro(422, "Cliente não encontrado");

    if (!clienteAutorizaTransporte(cliente, input.tipoTransporteId)) {
      return erro(
        422,
        `Tipo de transporte não autorizado para o cliente ${cliente.nome}`,
      );
    }

    if (!input.itensIds?.length) {
      return erro(422, "A ordem de venda deve conter ao menos um item");
    }

    const ordem: OrdemVenda = {
      id: uuid(),
      clienteId: input.clienteId,
      tipoTransporteId: input.tipoTransporteId,
      itensIds: input.itensIds,
      status: "CRIADA",
      criadaEm: new Date().toISOString(),
    };

    db.ordensVenda.push(ordem);
    persistir();
    registrarAuditoria("CRIACAO_OV", ordem.id, undefined, {
      status: ordem.status,
      clienteId: ordem.clienteId,
    });

    return HttpResponse.json(ordem, { status: 201 });
  }),

  http.patch(`${API}/ordens-venda/:id/status`, async ({ params, request }) => {
    const { status: novoStatus } = (await request.json()) as {
      status: StatusOrdemVenda;
    };
    const db = getDb();
    const ordem = db.ordensVenda.find((ov) => ov.id === params.id);

    if (!ordem) return erro(404, "Ordem de venda não encontrada");

    if (!podeTransicionar(ordem.status, novoStatus)) {
      return erro(
        422,
        `Transição inválida: ${STATUS_LABELS[ordem.status]} → ${STATUS_LABELS[novoStatus]}`,
      );
    }

    if (novoStatus === "AGENDADA" && !ordem.dadosAgendamento) {
      return erro(
        422,
        "Defina os dados de agendamento antes de mover a OV para Agendada",
      );
    }

    const estadoAnterior = { status: ordem.status };

    ordem.status = novoStatus;
    persistir();
    registrarAuditoria("ALTERACAO_STATUS", ordem.id, estadoAnterior, {
      status: novoStatus,
    });

    return HttpResponse.json(ordem);
  }),

  http.patch(
    `${API}/ordens-venda/:id/agendamento`,
    async ({ params, request }) => {
      const dados = (await request.json()) as DadosAgendamento;
      const db = getDb();
      const ordem = db.ordensVenda.find((ov) => ov.id === params.id);

      if (!ordem) return erro(404, "Ordem de venda não encontrada");

      if (ordem.status !== "PLANEJADA" && ordem.status !== "AGENDADA") {
        return erro(
          422,
          `Somente OVs planejadas ou agendadas podem receber agendamento (status atual: ${STATUS_LABELS[ordem.status]})`,
        );
      }

      const primeiroAgendamento = ordem.status === "PLANEJADA";
      const estadoAnterior = {
        status: ordem.status,
        ...ordem.dadosAgendamento,
      };

      ordem.dadosAgendamento = dados;

      if (primeiroAgendamento) ordem.status = "AGENDADA";

      persistir();
      registrarAuditoria(
        primeiroAgendamento ? "AGENDAMENTO" : "REAGENDAMENTO",
        ordem.id,
        estadoAnterior,
        { status: ordem.status, ...dados },
      );

      return HttpResponse.json(ordem);
    },
  ),

  // ── Auditorias ─────────────────────────────────────────────────────────
  http.get(`${API}/auditorias`, ({ request }) => {
    const url = new URL(request.url);
    const entidadeAfetada = url.searchParams.get("entidadeAfetada");

    let auditorias = [...getDb().auditorias];

    if (entidadeAfetada) {
      auditorias = auditorias.filter(
        (a) => a.entidadeAfetada === entidadeAfetada,
      );
    }

    auditorias.sort((a, b) => b.dataHora.localeCompare(a.dataHora));

    return HttpResponse.json(auditorias);
  }),
];
