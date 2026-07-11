import { beforeEach, describe, expect, it } from "vitest";
import { useFiltrosMonitoramentoStore } from "./filtrosMonitoramentoStore";

describe("useFiltrosMonitoramentoStore", () => {
  beforeEach(() => {
    useFiltrosMonitoramentoStore.setState({ filtros: {} });
  });

  it("adiciona filtro com valor truthy", () => {
    useFiltrosMonitoramentoStore.getState().setFiltro("status", "CRIADA");

    expect(useFiltrosMonitoramentoStore.getState().filtros).toEqual({
      status: "CRIADA",
    });
  });

  it("remove filtro quando valor é falsy", () => {
    useFiltrosMonitoramentoStore.getState().setFiltro("status", "CRIADA");
    useFiltrosMonitoramentoStore.getState().setFiltro("status", undefined);

    expect(useFiltrosMonitoramentoStore.getState().filtros).toEqual({});
  });

  it("limpa todos os filtros", () => {
    useFiltrosMonitoramentoStore.getState().setFiltro("status", "CRIADA");
    useFiltrosMonitoramentoStore.getState().setFiltro("data", "2026-07-10");
    useFiltrosMonitoramentoStore.getState().limparFiltros();

    expect(useFiltrosMonitoramentoStore.getState().filtros).toEqual({});
  });
});
