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
  executeCriarTipoTransporte,
  executeListarTiposTransporte,
} from "@/entities/tipo-transporte/application/tipoTransporteUseCases";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("tipoTransporteUseCases (integração)", () => {
  beforeEach(() => resetDb());

  it("lista e cria tipos de transporte", async () => {
    const tipos = await executeListarTiposTransporte();
    expect(tipos.length).toBeGreaterThan(0);

    const tipo = await executeCriarTipoTransporte({ descricao: "Tipo UC" });
    expect(tipo.descricao).toBe("Tipo UC");
  });
});
