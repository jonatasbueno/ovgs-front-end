import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import { TabelaOVs } from "./TabelaOVs";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const ordem: OrdemVenda = {
  id: "4d9a7f4b-6e5a-4f6d-9c8b-000000000099",
  clienteId: "2b7e5d2f-8c3e-4d4b-9a6f-000000000001",
  tipoTransporteId: "1a6f4c1e-9b2d-4c3a-8f5e-000000000001",
  itensIds: ["3c8f6e3a-7d4f-4e5c-8b7a-000000000001"],
  status: "AGENDADA",
  dadosAgendamento: { data: "2026-07-15", janela: "MANHA" },
  criadaEm: "2026-07-01T10:00:00.000Z",
};

describe("TabelaOVs", () => {
  it("exibe skeleton durante carregamento", () => {
    render(
      <TabelaOVs
        ordens={[]}
        nomesClientes={{}}
        nomesTransportes={{}}
        carregando
      />,
    );

    expect(screen.getByLabelText("Carregando ordens")).toBeInTheDocument();
  });

  it("exibe mensagem quando não há ordens", () => {
    render(<TabelaOVs ordens={[]} nomesClientes={{}} nomesTransportes={{}} />);

    expect(
      screen.getAllByText("Nenhuma ordem de venda encontrada.").length,
    ).toBeGreaterThan(0);
  });

  it("renderiza dados da ordem", () => {
    render(
      <TabelaOVs
        ordens={[ordem]}
        nomesClientes={{ [ordem.clienteId]: "Cliente Teste" }}
        nomesTransportes={{ [ordem.tipoTransporteId]: "Caminhão" }}
      />,
    );

    expect(screen.getAllByText("Cliente Teste").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Caminhão").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Agendada").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/15\/07\/2026/).length).toBeGreaterThan(0);
  });
});
