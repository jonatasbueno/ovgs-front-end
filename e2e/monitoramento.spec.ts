import { expect, test } from "@playwright/test";

test("monitoramento filtra ordens por status", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Status").click();
  await page.getByRole("option", { name: "Criada", exact: true }).click();

  await expect(page.getByText("Criada").first()).toBeVisible();

  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(
    page.getByRole("button", { name: "Limpar filtros" }),
  ).toHaveCount(0);
});

test("navega para detalhe da OV pelo dashboard", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("link", { name: /^Detalhes da OV/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/ordens-venda\/[0-9a-f-]+$/);
  await expect(page.getByText("Dados da ordem")).toBeVisible();
});
