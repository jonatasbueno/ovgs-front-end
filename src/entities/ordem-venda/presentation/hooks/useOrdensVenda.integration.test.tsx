import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useAgendarEntrega,
  useAvancarStatus,
  useOrdensVenda,
  useOrdemVenda,
} from "@/entities/ordem-venda/presentation/hooks/useOrdensVenda";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import { OV_CRIADA, OV_PLANEJADA } from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function criarWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useOrdensVenda (integração)", () => {
  beforeEach(() => resetDb());

  it("useOrdensVenda e useOrdemVenda carregam dados", async () => {
    const { wrapper } = criarWrapper();

    const { result: lista } = renderHook(() => useOrdensVenda(), { wrapper });
    await waitFor(() => expect(lista.current.isSuccess).toBe(true));
    expect(lista.current.data?.length).toBeGreaterThan(0);

    const { result: detalhe } = renderHook(() => useOrdemVenda(OV_CRIADA), {
      wrapper,
    });
    await waitFor(() => expect(detalhe.current.isSuccess).toBe(true));
    expect(detalhe.current.data?.id).toBe(OV_CRIADA);
  });

  it("useAvancarStatus atualiza cache da lista", async () => {
    const { wrapper, queryClient } = criarWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAvancarStatus(), { wrapper });

    act(() => {
      result.current.mutate({
        ordem: { id: OV_CRIADA, status: "CRIADA" },
        novoStatus: "PLANEJADA",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("useAgendarEntrega conclui agendamento", async () => {
    const { wrapper } = criarWrapper();
    const { result } = renderHook(() => useAgendarEntrega(), { wrapper });

    act(() => {
      result.current.mutate({
        id: OV_PLANEJADA,
        dados: { data: "2026-08-20", janela: "NOITE" },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("AGENDADA");
  });
});
