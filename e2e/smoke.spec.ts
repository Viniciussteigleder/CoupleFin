import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Painel mensal" })
  ).toBeVisible();
});

test("uploads loads", async ({ page }) => {
  await page.goto("/uploads");
  await expect(page.getByRole("heading", { name: "Uploads" })).toBeVisible();
  await expect(page.getByText("Importar CSV")).toBeVisible();
});

test("confirmar loads", async ({ page }) => {
  await page.goto("/confirmar");
  await expect(
    page.getByRole("heading", { name: "Fila de confirmacao" })
  ).toBeVisible();
});
