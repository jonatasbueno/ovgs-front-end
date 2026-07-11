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
import { useCriacaoOV } from "./useCriacaoOV";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import {
  CLIENTE_AURORA,
  ITEM_ARROZ,
  TRANSPORTE_CAMINHAO,
} from "@/shared/api/configMock/seed";

const pushMock = vi.fn();
const toastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/shared/adapters/toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useCriacaoOV", () => {
  beforeEach(() => {
    resetDb();
    pushMock.mockClear();
    toastSuccess.mockClear();
  });

  it("cria OV, exibe toast e redireciona", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCriacaoOV(), { wrapper });

    act(() => {
      result.current.criar({
        clienteId: CLIENTE_AURORA,
        tipoTransporteId: TRANSPORTE_CAMINHAO,
        itensIds: [ITEM_ARROZ],
      });
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalled());
    expect(toastSuccess).toHaveBeenCalled();
  });
});
