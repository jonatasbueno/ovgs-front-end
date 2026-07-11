import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb, persistir, resetDb } from "./db";
import { criarSeed } from "./seed";

describe("mock db", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    resetDb();
  });

  it("resetDb restaura o seed inicial", () => {
    const db = getDb();
    db.clientes.push({
      id: "2b7e5d2f-8c3e-4d4b-9a6f-000000000099",
      nome: "Temporário",
      transportesAutorizadosIds: ["1a6f4c1e-9b2d-4c3a-8f5e-000000000001"],
    });

    resetDb();

    expect(getDb().clientes).toHaveLength(criarSeed().clientes.length);
  });

  it("getDb retorna a mesma instância em memória", () => {
    expect(getDb()).toBe(getDb());
  });

  it("persistir grava no sessionStorage quando disponível", () => {
    const setItem = vi.fn();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: vi.fn(),
        setItem,
        removeItem: vi.fn(),
      },
    });

    resetDb();
    persistir();

    expect(setItem).toHaveBeenCalled();
  });
});
