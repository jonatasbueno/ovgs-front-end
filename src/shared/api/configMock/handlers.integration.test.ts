import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { httpClient } from "@/shared/api/httpClient";
import { getDb, resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import {
  CLIENTE_AURORA,
  ITEM_ARROZ,
  OV_AGENDADA,
  OV_CRIADA,
  OV_PLANEJADA,
  OV_ENTREGUE,
  TRANSPORTE_BITRUCK,
  TRANSPORTE_CAMINHAO,
  criarSeed,
} from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("handlers MSW (integração)", () => {
  beforeEach(() => {
    resetDb();
  });

  describe("clientes", () => {
    it("lista clientes do seed", async () => {
      const { data } = await httpClient.get("/clientes");
      expect(data).toHaveLength(criarSeed().clientes.length);
    });

    it("busca cliente por id", async () => {
      const { data } = await httpClient.get(`/clientes/${CLIENTE_AURORA}`);
      expect(data.nome).toBe("Distribuidora Aurora");
    });

    it("retorna 404 para cliente inexistente", async () => {
      await expect(
        httpClient.get("/clientes/00000000-0000-4000-8000-000000000099"),
      ).rejects.toMatchObject({ response: { status: 404 } });
    });

    it("cria cliente", async () => {
      const { data, status } = await httpClient.post("/clientes", {
        nome: "Novo Cliente",
        transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
      });

      expect(status).toBe(201);
      expect(data.nome).toBe("Novo Cliente");
      expect(getDb().clientes.some((c) => c.id === data.id)).toBe(true);
    });

    it("atualiza cliente existente", async () => {
      const { data } = await httpClient.put(`/clientes/${CLIENTE_AURORA}`, {
        nome: "Aurora Atualizada",
        transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
      });

      expect(data.nome).toBe("Aurora Atualizada");
    });
  });

  describe("tipos de transporte e itens", () => {
    it("cria tipo de transporte", async () => {
      const { data, status } = await httpClient.post("/tipos-transporte", {
        descricao: "Moto",
      });

      expect(status).toBe(201);
      expect(data.descricao).toBe("Moto");
    });

    it("cria item", async () => {
      const { data, status } = await httpClient.post("/itens", {
        descricao: "Produto teste",
        pesoKg: 10,
      });

      expect(status).toBe(201);
      expect(data.descricao).toBe("Produto teste");
    });
  });

  describe("ordens de venda", () => {
    it("lista OVs com filtros", async () => {
      const { data: porStatus } = await httpClient.get("/ordens-venda", {
        params: { status: "CRIADA" },
      });
      expect(
        porStatus.every((ov: { status: string }) => ov.status === "CRIADA"),
      ).toBe(true);

      const { data: porCliente } = await httpClient.get("/ordens-venda", {
        params: { clienteId: CLIENTE_AURORA },
      });
      expect(
        porCliente.every(
          (ov: { clienteId: string }) => ov.clienteId === CLIENTE_AURORA,
        ),
      ).toBe(true);

      const { data: porTransporte } = await httpClient.get("/ordens-venda", {
        params: { tipoTransporteId: TRANSPORTE_CAMINHAO },
      });
      expect(
        porTransporte.every(
          (ov: { tipoTransporteId: string }) =>
            ov.tipoTransporteId === TRANSPORTE_CAMINHAO,
        ),
      ).toBe(true);

      const { data: porData } = await httpClient.get("/ordens-venda", {
        params: { data: "2026-01-01" },
      });
      expect(Array.isArray(porData)).toBe(true);
    });

    it("rejeita OV sem itens", async () => {
      await expect(
        httpClient.post("/ordens-venda", {
          clienteId: CLIENTE_AURORA,
          tipoTransporteId: TRANSPORTE_CAMINHAO,
          itensIds: [],
        }),
      ).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("busca OV por id", async () => {
      const { data } = await httpClient.get(`/ordens-venda/${OV_CRIADA}`);
      expect(data.id).toBe(OV_CRIADA);
    });

    it("cria OV com transporte autorizado", async () => {
      const { data, status } = await httpClient.post("/ordens-venda", {
        clienteId: CLIENTE_AURORA,
        tipoTransporteId: TRANSPORTE_CAMINHAO,
        itensIds: [ITEM_ARROZ],
      });

      expect(status).toBe(201);
      expect(data.status).toBe("CRIADA");
      expect(getDb().auditorias.some((a) => a.tipoAcao === "CRIACAO_OV")).toBe(
        true,
      );
    });

    it("rejeita OV com transporte não autorizado", async () => {
      await expect(
        httpClient.post("/ordens-venda", {
          clienteId: CLIENTE_AURORA,
          tipoTransporteId: TRANSPORTE_BITRUCK,
          itensIds: [ITEM_ARROZ],
        }),
      ).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("rejeita transição inválida de status", async () => {
      await expect(
        httpClient.patch(`/ordens-venda/${OV_CRIADA}/status`, {
          status: "AGENDADA",
        }),
      ).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("avança status sequencialmente", async () => {
      await httpClient.patch(`/ordens-venda/${OV_CRIADA}/status`, {
        status: "PLANEJADA",
      });

      const { data } = await httpClient.get(`/ordens-venda/${OV_CRIADA}`);
      expect(data.status).toBe("PLANEJADA");
    });

    it("exige agendamento antes de ir para AGENDADA via status", async () => {
      await expect(
        httpClient.patch(`/ordens-venda/${OV_PLANEJADA}/status`, {
          status: "AGENDADA",
        }),
      ).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("agenda entrega e move PLANEJADA para AGENDADA", async () => {
      const { data } = await httpClient.patch(
        `/ordens-venda/${OV_PLANEJADA}/agendamento`,
        { data: "2026-08-01", janela: "TARDE" },
      );

      expect(data.status).toBe("AGENDADA");
      expect(data.dadosAgendamento).toEqual({
        data: "2026-08-01",
        janela: "TARDE",
      });
    });

    it("reagenda OV já agendada", async () => {
      const { data } = await httpClient.patch(
        `/ordens-venda/${OV_AGENDADA}/agendamento`,
        { data: "2026-08-05", janela: "NOITE" },
      );

      expect(data.status).toBe("AGENDADA");
      expect(data.dadosAgendamento?.data).toBe("2026-08-05");
      expect(
        getDb().auditorias.some((a) => a.tipoAcao === "REAGENDAMENTO"),
      ).toBe(true);
    });

    it("rejeita agendamento em status inválido", async () => {
      await expect(
        httpClient.patch(`/ordens-venda/${OV_CRIADA}/agendamento`, {
          data: "2026-08-01",
          janela: "MANHA",
        }),
      ).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("conclui entrega e registra entregueEm", async () => {
      const db = getDb();
      const ovTransporte = db.ordensVenda.find(
        (ov) => ov.status === "EM_TRANSPORTE",
      );
      expect(ovTransporte).toBeDefined();

      const { data } = await httpClient.patch(
        `/ordens-venda/${ovTransporte!.id}/status`,
        { status: "ENTREGUE" },
      );

      expect(data.status).toBe("ENTREGUE");
      expect(data.entregueEm).toBeTruthy();
    });

    it("sincroniza entregueEm em OVs antigas sem o campo", async () => {
      const db = getDb();
      const ovEntregue = db.ordensVenda.find((ov) => ov.id === OV_ENTREGUE);
      if (ovEntregue) {
        delete ovEntregue.entregueEm;
      }

      db.auditorias.push({
        id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000099",
        dataHora: "2026-07-08T12:00:00.000Z",
        tipoAcao: "ALTERACAO_STATUS",
        entidadeAfetada: OV_ENTREGUE,
        estadoPosterior: { status: "ENTREGUE" },
      });

      const { data } = await httpClient.get(`/ordens-venda/${OV_ENTREGUE}`);

      expect(data.entregueEm).toBe("2026-07-08T12:00:00.000Z");
    });
  });

  describe("auditorias", () => {
    it("lista auditorias filtradas por entidade", async () => {
      const { data } = await httpClient.get("/auditorias", {
        params: { entidadeAfetada: OV_CRIADA },
      });

      expect(data.length).toBeGreaterThan(0);
      expect(
        data.every(
          (a: { entidadeAfetada: string }) => a.entidadeAfetada === OV_CRIADA,
        ),
      ).toBe(true);
    });
  });
});
