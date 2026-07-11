import { describe, expect, it } from "vitest";
import { auditoriaSchema, TIPO_ACAO_LABELS } from "./auditoriaSchema";

describe("auditoriaSchema", () => {
  it("valida auditoria completa", () => {
    const resultado = auditoriaSchema.safeParse({
      id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000001",
      dataHora: "2026-07-10T12:00:00.000Z",
      tipoAcao: "CRIACAO_OV",
      entidadeAfetada: "4d9a7f4b-6e5a-4f6d-9c8b-000000000001",
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita tipo de ação inválido", () => {
    const resultado = auditoriaSchema.safeParse({
      id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000001",
      dataHora: "2026-07-10T12:00:00.000Z",
      tipoAcao: "INVALIDO",
      entidadeAfetada: "ov-1",
    });

    expect(resultado.success).toBe(false);
  });
});

describe("TIPO_ACAO_LABELS", () => {
  it("possui label para cada tipo", () => {
    expect(TIPO_ACAO_LABELS.CRIACAO_OV).toBe("Criação de OV");
    expect(TIPO_ACAO_LABELS.AGENDAMENTO).toBe("Agendamento");
  });
});
