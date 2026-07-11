import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModalAgendamento } from "./ModalAgendamento";

describe("ModalAgendamento", () => {
  it("renderiza título de agendamento inicial", () => {
    render(
      <ModalAgendamento
        aberto
        onAbertoChange={vi.fn()}
        onConfirmar={vi.fn()}
      />,
    );

    expect(screen.getByText("Agendar entrega")).toBeInTheDocument();
    expect(screen.getByLabelText("Data da entrega")).toBeInTheDocument();
  });

  it("renderiza título de reagendamento", () => {
    render(
      <ModalAgendamento
        aberto
        onAbertoChange={vi.fn()}
        onConfirmar={vi.fn()}
        reagendamento
        valoresIniciais={{ data: "2026-08-01", janela: "TARDE" }}
      />,
    );

    expect(screen.getByText("Reagendar entrega")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar reagendamento" }),
    ).toBeInTheDocument();
  });

  it("fecha ao cancelar", async () => {
    const onAbertoChange = vi.fn();
    const usuario = userEvent.setup();

    render(
      <ModalAgendamento
        aberto
        onAbertoChange={onAbertoChange}
        onConfirmar={vi.fn()}
      />,
    );

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onAbertoChange).toHaveBeenCalledWith(false);
  });
});
