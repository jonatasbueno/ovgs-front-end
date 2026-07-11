import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { OrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import { useProgressaoStatus } from "./useProgressaoStatus";

const mutateMock = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/entities/ordem-venda", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/entities/ordem-venda")>();
  return {
    ...actual,
    useAvancarStatus: () => ({
      mutate: mutateMock,
      isPending: false,
    }),
  };
});

vi.mock("@/shared/adapters/toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const ordemPlanejada: OrdemVenda = {
  id: "4d9a7f4b-6e5a-4f6d-9c8b-000000000002",
  clienteId: "2b7e5d2f-8c3e-4d4b-9a6f-000000000003",
  tipoTransporteId: "1a6f4c1e-9b2d-4c3a-8f5e-000000000002",
  itensIds: ["3c8f6e3a-7d4f-4e5c-8b7a-000000000001"],
  status: "PLANEJADA",
  criadaEm: "2026-07-01T10:00:00.000Z",
};

describe("useProgressaoStatus", () => {
  beforeEach(() => {
    mutateMock.mockClear();
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it("bloqueia avanço para AGENDADA sem dados de agendamento", () => {
    const { result } = renderHook(() => useProgressaoStatus(ordemPlanejada));

    expect(result.current.statusSeguinte).toBe("AGENDADA");
    expect(result.current.avancoBloqueadoPorAgendamento).toBe(true);
  });

  it("dispara mutação ao avançar status", () => {
    const ordemCriada: OrdemVenda = { ...ordemPlanejada, status: "CRIADA" };
    const { result } = renderHook(() => useProgressaoStatus(ordemCriada));

    act(() => {
      result.current.avancar();
    });

    expect(mutateMock).toHaveBeenCalledWith(
      { ordem: ordemCriada, novoStatus: "PLANEJADA" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("não avança quando ordem é undefined", () => {
    const { result } = renderHook(() => useProgressaoStatus(undefined));

    act(() => {
      result.current.avancar();
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });
});
