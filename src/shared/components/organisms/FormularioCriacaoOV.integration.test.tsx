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
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/shared/api/configMock/server";
import { resetDb } from "@/shared/api/configMock/db";
import { criarSeed } from "@/shared/api/configMock/seed";
import { useCriarOrdemVenda } from "@/entities/ordem-venda";
import { FormularioCriacaoOV } from "./FormularioCriacaoOV";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const seed = criarSeed();

function Harness() {
  const mutation = useCriarOrdemVenda();
  return (
    <FormularioCriacaoOV
      clientes={seed.clientes}
      tiposTransporte={seed.tiposTransporte}
      itens={seed.itens}
      onSubmit={(input) => mutation.mutate(input)}
      enviando={mutation.isPending}
    />
  );
}

describe("FormularioCriacaoOV (integração)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    resetDb();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  function renderizar() {
    return render(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    );
  }

  it("preenche o formulário, submete via MSW e invalida as queries", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const usuario = userEvent.setup();
    renderizar();

    // Seleciona o cliente
    await usuario.click(screen.getByRole("combobox", { name: "Cliente" }));
    await usuario.click(
      await screen.findByRole("option", { name: "Distribuidora Aurora" }),
    );

    // Seleciona um transporte autorizado para o cliente
    await usuario.click(
      screen.getByRole("combobox", { name: "Tipo de transporte" }),
    );
    await usuario.click(
      await screen.findByRole("option", { name: "Caminhão" }),
    );

    // Seleciona ao menos um item
    await usuario.click(screen.getByRole("checkbox", { name: /Arroz tipo 1/ }));

    await usuario.click(
      screen.getByRole("button", { name: "Criar ordem de venda" }),
    );

    // A mutação (interceptada pelo MSW) deve concluir e invalidar o cache
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["ordens-venda"],
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["auditorias"] });
  });

  it("bloqueia a submissão quando o transporte não é autorizado para o cliente", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const usuario = userEvent.setup();
    renderizar();

    // Cliente Aurora NÃO autoriza Bi-truck: a opção deve estar desabilitada
    await usuario.click(screen.getByRole("combobox", { name: "Cliente" }));
    await usuario.click(
      await screen.findByRole("option", { name: "Distribuidora Aurora" }),
    );

    await usuario.click(
      screen.getByRole("combobox", { name: "Tipo de transporte" }),
    );
    const opcaoBloqueada = await screen.findByRole("option", {
      name: /Bi-truck \(não autorizado\)/,
    });
    expect(opcaoBloqueada).toHaveAttribute("aria-disabled", "true");

    // Fecha o select e tenta submeter sem transporte: erro de validação visível
    await usuario.keyboard("{Escape}");
    await usuario.click(screen.getByRole("checkbox", { name: /Arroz tipo 1/ }));
    await usuario.click(
      screen.getByRole("button", { name: "Criar ordem de venda" }),
    );

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
