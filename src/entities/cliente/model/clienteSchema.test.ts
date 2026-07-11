import { describe, expect, it } from "vitest";
import { clienteAutorizaTransporte, criarClienteSchema } from "./clienteSchema";

const TRANSPORTE_A = "1a6f4c1e-9b2d-4c3a-8f5e-000000000001";
const TRANSPORTE_B = "1a6f4c1e-9b2d-4c3a-8f5e-000000000002";

describe("clienteAutorizaTransporte", () => {
  it("retorna true quando o transporte está autorizado", () => {
    expect(
      clienteAutorizaTransporte(
        { transportesAutorizadosIds: [TRANSPORTE_A] },
        TRANSPORTE_A,
      ),
    ).toBe(true);
  });

  it("retorna false quando o transporte não está autorizado", () => {
    expect(
      clienteAutorizaTransporte(
        { transportesAutorizadosIds: [TRANSPORTE_A] },
        TRANSPORTE_B,
      ),
    ).toBe(false);
  });
});

describe("criarClienteSchema", () => {
  it("exige ao menos um transporte autorizado", () => {
    const resultado = criarClienteSchema.safeParse({
      nome: "Cliente Teste",
      transportesAutorizadosIds: [],
    });

    expect(resultado.success).toBe(false);
  });

  it("aceita cliente válido", () => {
    const resultado = criarClienteSchema.safeParse({
      nome: "Cliente Teste",
      transportesAutorizadosIds: [TRANSPORTE_A],
    });

    expect(resultado.success).toBe(true);
  });
});
