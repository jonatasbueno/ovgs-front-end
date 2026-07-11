import { describe, expect, it } from "vitest";
import { criarTipoTransporteSchema } from "./tipoTransporteSchema";

describe("criarTipoTransporteSchema", () => {
  it("exige descrição não vazia", () => {
    expect(criarTipoTransporteSchema.safeParse({ descricao: "" }).success).toBe(
      false,
    );
  });

  it("aceita descrição válida", () => {
    expect(
      criarTipoTransporteSchema.safeParse({ descricao: "Caminhão" }).success,
    ).toBe(true);
  });
});
