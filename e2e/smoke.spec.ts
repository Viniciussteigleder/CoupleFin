import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Painel Mensal" })).toBeVisible();
});

test("uploads loads", async ({ page }) => {
  await page.goto("/uploads");
  await expect(page.getByRole("heading", { name: "Uploads" })).toBeVisible();
});

test("confirmar loads", async ({ page }) => {
  await page.goto("/confirm-queue");
  await expect(page.getByRole("heading", { name: "Fila de Pendências" })).toBeVisible();
});
