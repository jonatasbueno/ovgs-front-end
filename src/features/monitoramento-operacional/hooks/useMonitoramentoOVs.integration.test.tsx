import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMonitoramentoOVs } from "./useMonitoramentoOVs";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import { useFiltrosMonitoramentoStore } from "@/shared/stores/filtrosMonitoramentoStore";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useMonitoramentoOVs (integração)", () => {
  beforeEach(() => {
    resetDb();
    useFiltrosMonitoramentoStore.setState({ filtros: {} });
  });

  it("carrega ordens, clientes e mapas de nomes", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMonitoramentoOVs(), { wrapper });

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.ordens.length).toBeGreaterThan(0);
    expect(Object.keys(result.current.nomesClientes).length).toBeGreaterThan(0);
    expect(Object.keys(result.current.nomesTransportes).length).toBeGreaterThan(
      0,
    );
  });
});
