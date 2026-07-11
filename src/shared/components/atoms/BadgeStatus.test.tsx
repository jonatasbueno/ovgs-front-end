import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BadgeStatus } from "./BadgeStatus";

describe("BadgeStatus", () => {
  it.each([
    ["CRIADA", "Criada"],
    ["PLANEJADA", "Planejada"],
    ["AGENDADA", "Agendada"],
    ["EM_TRANSPORTE", "Em transporte"],
    ["ENTREGUE", "Entregue"],
  ] as const)("renderiza label para status %s", (status, label) => {
    render(<BadgeStatus status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
