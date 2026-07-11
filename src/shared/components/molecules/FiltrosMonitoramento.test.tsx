import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FiltrosMonitoramento } from "./FiltrosMonitoramento";
import {
  CLIENTE_AURORA,
  TRANSPORTE_CAMINHAO,
  criarSeed,
} from "@/shared/api/configMock/seed";

const seed = criarSeed();

describe("FiltrosMonitoramento", () => {
  it("propaga mudança de status e limpa filtros", async () => {
    const onFiltroChange = vi.fn();
    const onLimpar = vi.fn();
    const usuario = userEvent.setup();

    render(
      <FiltrosMonitoramento
        filtros={{ status: "CRIADA" }}
        clientes={seed.clientes}
        tiposTransporte={seed.tiposTransporte}
        onFiltroChange={onFiltroChange}
        onLimpar={onLimpar}
      />,
    );

    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onLimpar).toHaveBeenCalledOnce();
  });

  it("renderiza combobox de cliente e select de status", () => {
    render(
      <FiltrosMonitoramento
        filtros={{}}
        clientes={seed.clientes}
        tiposTransporte={seed.tiposTransporte}
        onFiltroChange={vi.fn()}
        onLimpar={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Cliente")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de transporte")).toBeInTheDocument();
  });

  it("não exibe botão limpar sem filtros ativos", () => {
    render(
      <FiltrosMonitoramento
        filtros={{}}
        clientes={seed.clientes}
        tiposTransporte={seed.tiposTransporte}
        onFiltroChange={vi.fn()}
        onLimpar={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Limpar filtros" }),
    ).not.toBeInTheDocument();
  });

  it("exibe botão limpar quando há filtros", () => {
    render(
      <FiltrosMonitoramento
        filtros={{
          clienteId: CLIENTE_AURORA,
          tipoTransporteId: TRANSPORTE_CAMINHAO,
        }}
        clientes={seed.clientes}
        tiposTransporte={seed.tiposTransporte}
        onFiltroChange={vi.fn()}
        onLimpar={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeInTheDocument();
  });
});
