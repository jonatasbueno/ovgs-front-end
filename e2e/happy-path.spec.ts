import { expect, test } from "@playwright/test";

/**
 * Happy path completo:
 * criar um cliente → criar uma OV para ele → avançar o fluxo até ENTREGUE,
 * passando pelo agendamento obrigatório (PLANEJADA → AGENDADA).
 */
test("cria cliente, cria OV e avança o fluxo até Entregue", async ({
  page,
}) => {
  const nomeCliente = `Cliente E2E ${Date.now()}`;

  // 1. Criar cliente autorizado a receber Caminhão
  await page.goto("/cadastros/clientes");
  await page.getByRole("button", { name: "Novo cliente" }).click();
  await page.getByLabel("Nome").fill(nomeCliente);
  await page.getByRole("checkbox", { name: "Caminhão", exact: true }).check();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(
    page.getByRole("cell", { name: nomeCliente, exact: true }),
  ).toBeVisible();

  // 2. Criar OV para o cliente
  await page.goto("/ordens-venda/nova");
  await page.getByRole("combobox", { name: "Cliente" }).click();
  await page.getByRole("option", { name: nomeCliente }).click();
  await page.getByRole("combobox", { name: "Tipo de transporte" }).click();
  await page.getByRole("option", { name: "Caminhão", exact: true }).click();
  await page.getByRole("checkbox", { name: /Arroz tipo 1/ }).check();
  await page.getByRole("button", { name: "Criar ordem de venda" }).click();

  // Redireciona para os detalhes da OV criada
  await expect(page).toHaveURL(/\/ordens-venda\/[0-9a-f-]+$/);
  await expect(page.getByText("Criada", { exact: true }).first()).toBeVisible();

  // 3. CRIADA → PLANEJADA
  await page.getByRole("button", { name: "Avançar para Planejada" }).click();

  // 4. PLANEJADA → AGENDADA (via agendamento obrigatório)
  const botaoAvancarAgendada = page.getByRole("button", {
    name: "Avançar para Agendada",
  });
  await expect(botaoAvancarAgendada).toBeDisabled();

  await page.getByRole("button", { name: "Agendar entrega" }).click();
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  await page.getByLabel("Data da entrega").fill(amanha);
  await page.getByRole("combobox", { name: "Janela de atendimento" }).click();
  await page.getByRole("option", { name: /Manhã/ }).click();
  await page.getByRole("button", { name: "Confirmar agendamento" }).click();

  // 5. AGENDADA → EM_TRANSPORTE → ENTREGUE
  await page
    .getByRole("button", { name: "Avançar para Em transporte" })
    .click();
  await page.getByRole("button", { name: "Avançar para Entregue" }).click();

  await expect(
    page.getByText("Esta OV concluiu o fluxo operacional", { exact: false }),
  ).toBeVisible();

  // Auditoria registrou os eventos do ciclo de vida
  const badgesAuditoria = page.locator('[data-slot="badge"]');
  await expect(
    badgesAuditoria.filter({ hasText: "Criação de OV" }),
  ).toBeVisible();
  await expect(
    badgesAuditoria.filter({ hasText: /^Agendamento$/ }),
  ).toBeVisible();
});
