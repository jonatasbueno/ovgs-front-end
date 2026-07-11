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
  executeAtualizarCliente,
  executeBuscarCliente,
  executeCriarCliente,
  executeListarClientes,
} from "@/entities/cliente/application/clienteUseCases";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import {
  CLIENTE_AURORA,
  TRANSPORTE_CAMINHAO,
} from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("clienteUseCases (integração)", () => {
  beforeEach(() => resetDb());

  it("lista e busca clientes", async () => {
    const clientes = await executeListarClientes();
    expect(clientes.length).toBeGreaterThan(0);

    const cliente = await executeBuscarCliente(CLIENTE_AURORA);
    expect(cliente.nome).toBe("Distribuidora Aurora");
  });

  it("cria e atualiza cliente", async () => {
    const criado = await executeCriarCliente({
      nome: "Cliente UC",
      transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
    });

    const atualizado = await executeAtualizarCliente(criado.id, {
      nome: "Cliente UC Editado",
      transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
    });

    expect(atualizado.nome).toBe("Cliente UC Editado");
  });
});
