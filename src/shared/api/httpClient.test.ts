import axios from "axios";
import { describe, expect, it } from "vitest";
import { extractApiError } from "./httpClient";

describe("extractApiError", () => {
  it("extrai mensagem do corpo da resposta Axios", () => {
    const erro = extractApiError(
      new axios.AxiosError(
        "Request failed",
        "ERR_BAD_REQUEST",
        undefined,
        undefined,
        {
          status: 422,
          data: { message: "Transporte não autorizado" },
          statusText: "Unprocessable Entity",
          headers: {},
          config: { headers: new axios.AxiosHeaders() },
        },
      ),
    );

    expect(erro).toEqual({
      message: "Transporte não autorizado",
      status: 422,
    });
  });

  it("usa message do AxiosError quando corpo não tem mensagem", () => {
    const erro = extractApiError(
      new axios.AxiosError("Network Error", "ERR_NETWORK"),
    );

    expect(erro.message).toBe("Network Error");
  });

  it("converte Error genérico", () => {
    expect(extractApiError(new Error("Falha local"))).toEqual({
      message: "Falha local",
    });
  });

  it("retorna fallback para valor desconhecido", () => {
    expect(extractApiError("oops")).toEqual({
      message: "Erro inesperado. Tente novamente.",
    });
  });
});
