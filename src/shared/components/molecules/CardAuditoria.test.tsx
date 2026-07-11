import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardAuditoria } from "./CardAuditoria";

describe("CardAuditoria", () => {
  it("exibe tipo de ação, data e estados formatados", () => {
    render(
      <CardAuditoria
        auditoria={{
          id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000001",
          dataHora: "2026-07-10T15:30:00.000Z",
          tipoAcao: "ALTERACAO_STATUS",
          entidadeAfetada: "4d9a7f4b-6e5a-4f6d-9c8b-000000000001",
          estadoAnterior: { status: "CRIADA" },
          estadoPosterior: { status: "PLANEJADA" },
        }}
      />,
    );

    expect(screen.getByText("Alteração de status")).toBeInTheDocument();
    expect(screen.getByText(/Antes:/)).toBeInTheDocument();
    expect(screen.getByText(/status: Criada/)).toBeInTheDocument();
    expect(screen.getByText(/Depois:/)).toBeInTheDocument();
    expect(screen.getByText(/status: Planejada/)).toBeInTheDocument();
  });

  it("substitui underscores em valores genéricos", () => {
    render(
      <CardAuditoria
        auditoria={{
          id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000002",
          dataHora: "2026-07-10T15:30:00.000Z",
          tipoAcao: "REAGENDAMENTO",
          entidadeAfetada: "4d9a7f4b-6e5a-4f6d-9c8b-000000000001",
          estadoPosterior: { janela: "EM_TRANSPORTE" },
        }}
      />,
    );

    expect(screen.getByText(/janela: EM TRANSPORTE/)).toBeInTheDocument();
  });
});
