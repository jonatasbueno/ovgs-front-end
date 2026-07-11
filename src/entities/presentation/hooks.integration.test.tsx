import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useClientes,
  useCriarCliente,
} from "@/entities/cliente/presentation/hooks/useClientes";
import {
  useItens,
  useCriarItem,
} from "@/entities/item/presentation/hooks/useItens";
import {
  useTiposTransporte,
  useCriarTipoTransporte,
} from "@/entities/tipo-transporte/presentation/hooks/useTiposTransporte";
import { useAuditorias } from "@/entities/auditoria/presentation/hooks/useAuditorias";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import { OV_CRIADA, TRANSPORTE_CAMINHAO } from "@/shared/api/configMock/seed";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapperFactory() {
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

describe("hooks de entidades (integração)", () => {
  beforeEach(() => resetDb());

  it("useClientes e useCriarCliente", async () => {
    const { wrapper } = wrapperFactory();
    const { result: lista } = renderHook(() => useClientes(), { wrapper });
    await waitFor(() => expect(lista.current.isSuccess).toBe(true));

    const { result: criar } = renderHook(() => useCriarCliente(), { wrapper });
    act(() => {
      criar.current.mutate({
        nome: "Hook Cliente",
        transportesAutorizadosIds: [TRANSPORTE_CAMINHAO],
      });
    });
    await waitFor(() => expect(criar.current.isSuccess).toBe(true));
  });

  it("useItens e useCriarItem", async () => {
    const { wrapper } = wrapperFactory();
    const { result: lista } = renderHook(() => useItens(), { wrapper });
    await waitFor(() => expect(lista.current.isSuccess).toBe(true));

    const { result: criar } = renderHook(() => useCriarItem(), { wrapper });
    act(() => {
      criar.current.mutate({ descricao: "Hook Item", pesoKg: 2 });
    });
    await waitFor(() => expect(criar.current.isSuccess).toBe(true));
  });

  it("useTiposTransporte e useCriarTipoTransporte", async () => {
    const { wrapper } = wrapperFactory();
    const { result: lista } = renderHook(() => useTiposTransporte(), {
      wrapper,
    });
    await waitFor(() => expect(lista.current.isSuccess).toBe(true));

    const { result: criar } = renderHook(() => useCriarTipoTransporte(), {
      wrapper,
    });
    act(() => {
      criar.current.mutate({ descricao: "Hook Transporte" });
    });
    await waitFor(() => expect(criar.current.isSuccess).toBe(true));
  });

  it("useAuditorias filtra por OV", async () => {
    const { wrapper } = wrapperFactory();
    const { result } = renderHook(() => useAuditorias(OV_CRIADA), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });
});
