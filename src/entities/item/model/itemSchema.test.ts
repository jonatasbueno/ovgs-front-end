import { describe, expect, it } from "vitest";
import { criarItemSchema } from "./itemSchema";

describe("criarItemSchema", () => {
  it("exige descrição", () => {
    expect(criarItemSchema.safeParse({ descricao: "" }).success).toBe(false);
  });

  it("aceita item com peso ou volume", () => {
    expect(
      criarItemSchema.safeParse({ descricao: "Item A", pesoKg: 5 }).success,
    ).toBe(true);
    expect(
      criarItemSchema.safeParse({ descricao: "Item B", volumeM3: 0.5 }).success,
    ).toBe(true);
  });

  it("rejeita peso não positivo", () => {
    expect(
      criarItemSchema.safeParse({ descricao: "Item", pesoKg: 0 }).success,
    ).toBe(false);
  });
});
