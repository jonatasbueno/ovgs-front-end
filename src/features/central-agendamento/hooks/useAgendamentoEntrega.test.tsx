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
import { useAgendamentoEntrega } from "./useAgendamentoEntrega";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";
import { OV_PLANEJADA } from "@/shared/api/configMock/seed";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/shared/adapters/toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useAgendamentoEntrega", () => {
  beforeEach(() => {
    resetDb();
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it("agenda entrega com toast de sucesso", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAgendamentoEntrega(), { wrapper });

    act(() => {
      result.current.agendar(OV_PLANEJADA, {
        data: "2026-08-15",
        janela: "MANHA",
      });
    });

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
  });
});
