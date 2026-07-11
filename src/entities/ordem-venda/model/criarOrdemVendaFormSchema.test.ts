import { describe, expect, it } from "vitest";
import type { Cliente } from "@/entities/cliente/model/clienteSchema";
import { buildCriarOrdemVendaFormSchema } from "./criarOrdemVendaFormSchema";

const CLIENTE_ID = "2b7e5d2f-8c3e-4d4b-9a6f-000000000001";
const TRANSPORTE_AUTORIZADO = "1a6f4c1e-9b2d-4c3a-8f5e-000000000001";
const TRANSPORTE_NAO_AUTORIZADO = "1a6f4c1e-9b2d-4c3a-8f5e-000000000099";
const ITEM_ID = "3c8f6e3a-7d4f-4e5c-8b7a-000000000001";

const clientes: Cliente[] = [
  {
    id: CLIENTE_ID,
    nome: "Distribuidora Aurora",
    transportesAutorizadosIds: [TRANSPORTE_AUTORIZADO],
  },
];

describe("buildCriarOrdemVendaFormSchema", () => {
  const schema = buildCriarOrdemVendaFormSchema(clientes);

  it("rejeita transporte não autorizado para o cliente", () => {
    const resultado = schema.safeParse({
      clienteId: CLIENTE_ID,
      tipoTransporteId: TRANSPORTE_NAO_AUTORIZADO,
      itensIds: [ITEM_ID],
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0]?.path).toEqual(["tipoTransporteId"]);
    }
  });

  it("aceita transporte autorizado", () => {
    const resultado = schema.safeParse({
      clienteId: CLIENTE_ID,
      tipoTransporteId: TRANSPORTE_AUTORIZADO,
      itensIds: [ITEM_ID],
    });

    expect(resultado.success).toBe(true);
  });

  it("ignora validação cruzada quando cliente não está na lista", () => {
    const resultado = schema.safeParse({
      clienteId: "2b7e5d2f-8c3e-4d4b-9a6f-000000000099",
      tipoTransporteId: TRANSPORTE_NAO_AUTORIZADO,
      itensIds: [ITEM_ID],
    });

    expect(resultado.success).toBe(true);
  });
});
