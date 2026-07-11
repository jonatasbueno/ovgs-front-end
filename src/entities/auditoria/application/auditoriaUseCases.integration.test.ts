import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { executeListarAuditorias } from "@/entities/auditoria/application/auditoriaUseCases";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import { OV_CRIADA } from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("auditoriaUseCases (integração)", () => {
  beforeEach(() => resetDb());

  it("lista auditorias por entidade", async () => {
    const auditorias = await executeListarAuditorias(OV_CRIADA);
    expect(auditorias.length).toBeGreaterThan(0);
    expect(auditorias[0]?.entidadeAfetada).toBe(OV_CRIADA);
  });
});
