import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepProgress } from "./StepProgress";

describe("StepProgress", () => {
  it("marca a etapa atual e as concluídas", () => {
    render(<StepProgress statusAtual="AGENDADA" />);

    const passos = screen.getAllByRole("listitem");
    expect(passos).toHaveLength(5);
    expect(screen.getByText("Agendada").className).toContain("font-medium");
    expect(
      screen.getByLabelText("Progresso da ordem de venda"),
    ).toBeInTheDocument();
  });
});
