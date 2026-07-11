import { describe, expect, it } from "vitest";
import {
  ajustarAgendamentoNaEntrega,
  formatarAgendamentoOrdem,
  resolverAgendamentoExibicao,
} from "./ordemVendaSchema";

describe("ajustarAgendamentoNaEntrega", () => {
  const agendamento = { data: "2026-07-15", janela: "MANHA" as const };

  it("mantém a data quando a entrega ocorre no dia agendado", () => {
    const resultado = ajustarAgendamentoNaEntrega(
      agendamento,
      new Date("2026-07-15T18:00:00"),
    );

    expect(resultado).toEqual(agendamento);
  });

  it("atualiza a data quando a entrega ocorre antes do agendamento", () => {
    const resultado = ajustarAgendamentoNaEntrega(
      agendamento,
      new Date("2026-07-10T14:30:00"),
    );

    expect(resultado).toEqual({ ...agendamento, data: "2026-07-10" });
  });

  it("atualiza a data quando a entrega ocorre depois do agendamento", () => {
    const resultado = ajustarAgendamentoNaEntrega(
      agendamento,
      new Date("2026-07-16T10:00:00"),
    );

    expect(resultado).toEqual({ ...agendamento, data: "2026-07-16" });
  });

  it("retorna undefined quando não há agendamento", () => {
    expect(ajustarAgendamentoNaEntrega(undefined)).toBeUndefined();
  });
});

describe("resolverAgendamentoExibicao", () => {
  it("usa a data de entrega efetiva para OVs entregues", () => {
    const ordem = {
      status: "ENTREGUE" as const,
      entregueEm: "2026-07-10T15:00:00.000Z",
      dadosAgendamento: { data: "2026-07-13", janela: "NOITE" as const },
    };

    expect(resolverAgendamentoExibicao(ordem)).toEqual({
      data: "2026-07-10",
      janela: "NOITE",
    });
  });

  it("formata o agendamento efetivo na listagem", () => {
    const ordem = {
      status: "ENTREGUE" as const,
      entregueEm: "2026-07-10T15:00:00.000Z",
      dadosAgendamento: { data: "2026-07-13", janela: "NOITE" as const },
    };

    expect(formatarAgendamentoOrdem(ordem)).toBe(
      "10/07/2026 · Noite (18h–22h)",
    );
  });
});
