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
import { useCadastroTransportes } from "./useCadastroTransportes";
import { resetDb } from "@/shared/api/configMock/db";
import { server } from "@/shared/api/configMock/server";

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

describe("useCadastroTransportes", () => {
  beforeEach(() => {
    resetDb();
    toastSuccess.mockClear();
  });

  it("cria transporte com feedback", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCadastroTransportes(), { wrapper });
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => {
      result.current.criar({ descricao: "Cadastro Feature" });
    });

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
  });
});
