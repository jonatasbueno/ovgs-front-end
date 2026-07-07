import { describe, expect, it, vi } from "vitest";
import type { Cliente } from "@/entities/cliente/model/clienteSchema";
import type { OrdemVenda } from "../model/ordemVendaSchema";
import {
  executeCriarOrdemVenda,
  TransporteNaoAutorizadoError,
} from "./ordemVendaUseCases";

const CLIENTE_ID = "2b7e5d2f-8c3e-4d4b-9a6f-000000000001";
const TRANSPORTE_AUTORIZADO = "1a6f4c1e-9b2d-4c3a-8f5e-000000000001";
const TRANSPORTE_NAO_AUTORIZADO = "1a6f4c1e-9b2d-4c3a-8f5e-000000000099";
const ITEM_ID = "3c8f6e3a-7d4f-4e5c-8b7a-000000000001";

const cliente: Cliente = {
  id: CLIENTE_ID,
  nome: "Distribuidora Aurora",
  transportesAutorizadosIds: [TRANSPORTE_AUTORIZADO],
};

function criarDeps() {
  return {
    buscarCliente: vi.fn().mockResolvedValue(cliente),
    criarOrdemVenda: vi
      .fn()
      .mockImplementation(async (input): Promise<OrdemVenda> => ({
        id: "4d9a7f4b-6e5a-4f6d-9c8b-000000000099",
        ...input,
        status: "CRIADA",
        criadaEm: new Date().toISOString(),
      })),
  };
}

describe("executeCriarOrdemVenda", () => {
  it("falha se o transporte não for autorizado para o cliente", async () => {
    const deps = criarDeps();

    await expect(
      executeCriarOrdemVenda(
        {
          clienteId: CLIENTE_ID,
          tipoTransporteId: TRANSPORTE_NAO_AUTORIZADO,
          itensIds: [ITEM_ID],
        },
        deps,
      ),
    ).rejects.toThrow(TransporteNaoAutorizadoError);

    expect(deps.criarOrdemVenda).not.toHaveBeenCalled();
  });

  it("falha se a OV não tiver ao menos um item (Zod)", async () => {
    const deps = criarDeps();

    await expect(
      executeCriarOrdemVenda(
        {
          clienteId: CLIENTE_ID,
          tipoTransporteId: TRANSPORTE_AUTORIZADO,
          itensIds: [],
        },
        deps,
      ),
    ).rejects.toThrow();

    expect(deps.buscarCliente).not.toHaveBeenCalled();
    expect(deps.criarOrdemVenda).not.toHaveBeenCalled();
  });

  it("cria a OV quando o transporte é autorizado", async () => {
    const deps = criarDeps();

    const ordem = await executeCriarOrdemVenda(
      {
        clienteId: CLIENTE_ID,
        tipoTransporteId: TRANSPORTE_AUTORIZADO,
        itensIds: [ITEM_ID],
      },
      deps,
    );

    expect(deps.criarOrdemVenda).toHaveBeenCalledOnce();
    expect(ordem.status).toBe("CRIADA");
  });
});
