import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  executeAgendarEntrega,
  executeAvancarStatus,
  executeBuscarOrdemVenda,
  executeListarOrdensVenda,
} from "@/entities/ordem-venda/application/ordemVendaUseCases";
import { TransicaoStatusInvalidaError } from "@/entities/ordem-venda/model/statusOrdemVenda";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import { OV_CRIADA, OV_PLANEJADA } from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ordemVendaUseCases (integração)", () => {
  beforeEach(() => resetDb());

  it("lista e busca ordens via API mockada", async () => {
    const ordens = await executeListarOrdensVenda({ status: "CRIADA" });
    expect(ordens.some((ov) => ov.id === OV_CRIADA)).toBe(true);

    const ordem = await executeBuscarOrdemVenda(OV_CRIADA);
    expect(ordem.status).toBe("CRIADA");
  });

  it("avança status com validação de domínio", async () => {
    const ordem = await executeBuscarOrdemVenda(OV_CRIADA);
    const atualizada = await executeAvancarStatus(ordem, "PLANEJADA");
    expect(atualizada.status).toBe("PLANEJADA");
  });

  it("propaga erro de transição inválida", async () => {
    const ordem = await executeBuscarOrdemVenda(OV_CRIADA);
    await expect(executeAvancarStatus(ordem, "ENTREGUE")).rejects.toThrow(
      TransicaoStatusInvalidaError,
    );
  });

  it("agenda entrega em OV planejada", async () => {
    const agendada = await executeAgendarEntrega(OV_PLANEJADA, {
      data: "2026-08-10",
      janela: "TARDE",
    });

    expect(agendada.status).toBe("AGENDADA");
    expect(agendada.dadosAgendamento?.janela).toBe("TARDE");
  });
});
