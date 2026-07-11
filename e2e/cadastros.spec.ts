import { expect, test } from "@playwright/test";

test("cadastra item e tipo de transporte", async ({ page }) => {
  const sufixo = Date.now();

  await page.goto("/cadastros/transportes");
  await page.getByLabel("Descrição").fill(`Transporte E2E ${sufixo}`);
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(
    page.getByRole("cell", { name: `Transporte E2E ${sufixo}`, exact: true }),
  ).toBeVisible();

  await page.goto("/cadastros/itens");
  await page.getByLabel("Descrição").fill(`Item E2E ${sufixo}`);
  await page.getByLabel("Peso (kg)").fill("12");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(
    page.getByRole("cell", { name: `Item E2E ${sufixo}`, exact: true }),
  ).toBeVisible();
});
