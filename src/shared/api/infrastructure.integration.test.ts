import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { clienteApi } from "@/entities/cliente/infrastructure/clienteApi";
import { itemApi } from "@/entities/item/infrastructure/itemApi";
import { tipoTransporteApi } from "@/entities/tipo-transporte/infrastructure/tipoTransporteApi";
import { ordemVendaApi } from "@/entities/ordem-venda/infrastructure/ordemVendaApi";
import { auditoriaApi } from "@/entities/auditoria/infrastructure/auditoriaApi";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import {
  CLIENTE_AURORA,
  ITEM_ARROZ,
  OV_CRIADA,
  TRANSPORTE_CAMINHAO,
  criarSeed,
} from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("camada de infraestrutura (integração MSW)", () => {
  beforeEach(() => resetDb());

  it("clienteApi lista, busca, cria e atualiza", async () => {
    const lista = await clienteApi.listar();
    expect(lista).toHaveLength(criarSeed().clientes.length);

    const cliente = await clienteApi.buscarPorId(CLIENTE_AURORA);
    expect(cliente.nome).toBe("Distribuidora Aurora");

    const novo = await clienteApi.criar({
      nome: "Via API",
      transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
    });
    expect(novo.id).toBeTruthy();

    const atualizado = await clienteApi.atualizar(novo.id, {
      nome: "Via API Atualizado",
      transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
    });
    expect(atualizado.nome).toBe("Via API Atualizado");
  });

  it("itemApi e tipoTransporteApi", async () => {
    const itens = await itemApi.listar();
    expect(itens.length).toBeGreaterThan(0);

    const item = await itemApi.criar({ descricao: "SKU API", pesoKg: 3 });
    expect(item.descricao).toBe("SKU API");

    const tipos = await tipoTransporteApi.listar();
    expect(tipos.length).toBeGreaterThan(0);

    const tipo = await tipoTransporteApi.criar({ descricao: "Modal API" });
    expect(tipo.descricao).toBe("Modal API");
  });

  it("ordemVendaApi cobre CRUD operacional", async () => {
    const ordens = await ordemVendaApi.listar({ status: "CRIADA" });
    expect(ordens.some((ov) => ov.id === OV_CRIADA)).toBe(true);

    const detalhe = await ordemVendaApi.buscarPorId(OV_CRIADA);
    expect(detalhe.status).toBe("CRIADA");

    const criada = await ordemVendaApi.criar({
      clienteId: CLIENTE_AURORA,
      tipoTransporteId: TRANSPORTE_CAMINHAO,
      itensIds: [ITEM_ARROZ],
    });
    expect(criada.status).toBe("CRIADA");

    const planejada = await ordemVendaApi.atualizarStatus(
      criada.id,
      "PLANEJADA",
    );
    const agendada = await ordemVendaApi.agendar(planejada.id, {
      data: "2026-09-01",
      janela: "MANHA",
    });
    expect(agendada.status).toBe("AGENDADA");
  });

  it("auditoriaApi lista por entidade", async () => {
    const auditorias = await auditoriaApi.listar(OV_CRIADA);
    expect(auditorias.length).toBeGreaterThan(0);
  });
});
