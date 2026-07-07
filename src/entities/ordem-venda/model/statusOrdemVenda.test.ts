import { describe, expect, it } from "vitest";
import {
  podeTransicionar,
  proximoStatus,
  TransicaoStatusInvalidaError,
  validarTransicaoStatus,
} from "./statusOrdemVenda";

describe("validarTransicaoStatus", () => {
  it.each([
    ["CRIADA", "PLANEJADA"],
    ["PLANEJADA", "AGENDADA"],
    ["AGENDADA", "EM_TRANSPORTE"],
    ["EM_TRANSPORTE", "ENTREGUE"],
  ] as const)("permite a transição válida %s → %s", (de, para) => {
    expect(() => validarTransicaoStatus(de, para)).not.toThrow();
  });

  it("lança erro ao pular etapas do fluxo (CRIADA → AGENDADA)", () => {
    expect(() => validarTransicaoStatus("CRIADA", "AGENDADA")).toThrow(
      TransicaoStatusInvalidaError,
    );
  });

  it("lança erro em retrocessos (EM_TRANSPORTE → PLANEJADA)", () => {
    expect(() => validarTransicaoStatus("EM_TRANSPORTE", "PLANEJADA")).toThrow(
      TransicaoStatusInvalidaError,
    );
  });

  it("lança erro ao transicionar para o mesmo status", () => {
    expect(() => validarTransicaoStatus("PLANEJADA", "PLANEJADA")).toThrow(
      TransicaoStatusInvalidaError,
    );
  });

  it("não permite transição a partir de ENTREGUE (estado final)", () => {
    expect(proximoStatus("ENTREGUE")).toBeNull();
    expect(podeTransicionar("ENTREGUE", "CRIADA")).toBe(false);
  });
});
