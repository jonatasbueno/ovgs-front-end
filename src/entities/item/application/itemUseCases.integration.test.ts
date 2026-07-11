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
  executeCriarItem,
  executeListarItens,
} from "@/entities/item/application/itemUseCases";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("itemUseCases (integração)", () => {
  beforeEach(() => resetDb());

  it("lista e cria itens", async () => {
    const itens = await executeListarItens();
    expect(itens.length).toBeGreaterThan(0);

    const item = await executeCriarItem({
      descricao: "Item UC",
      pesoKg: 7,
    });
    expect(item.descricao).toBe("Item UC");
  });
});
