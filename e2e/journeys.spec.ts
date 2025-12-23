import { test, expect, type Page } from "@playwright/test";

const expectHeading = async (page: Page, name: string) => {
  await expect(page.getByRole("heading", { name })).toBeVisible();
};

test("jornada A - primeiro uso", async ({ page }) => {
  await page.goto("/onboarding");
  await expectHeading(page, "Bem-vindos");

  await page.goto("/onboarding/categories");
  await expectHeading(page, "Categorias");

  await page.goto("/onboarding/budget");
  await expectHeading(page, "Orçamento Mensal");

  await page.goto("/onboarding/explicacao");
  await expectHeading(page, "Como funciona");

  await page.goto("/onboarding/accounts");
  await expectHeading(page, "Cartões detectados");

  await page.goto("/onboarding/ritual");
  await expectHeading(page, "Ritual do Casal");

  await page.goto("/onboarding/privacidade");
  await expectHeading(page, "Privacidade e consentimento");
});

test("jornada B - semanal", async ({ page }) => {
  await page.goto("/dashboard");
  await expectHeading(page, "Painel Mensal");

  await page.goto("/confirm-queue");
  await expectHeading(page, "Fila de Pendências");

  await page.goto("/ritual/weekly");
  await expectHeading(page, "Ritual Semanal");

  await page.goto("/calendar");
  await expectHeading(page, "Calendário");
});

test("jornada C - criar regra", async ({ page }) => {
  await page.goto("/confirm-queue");
  await expectHeading(page, "Fila de Pendências");

  await page.goto("/rules/new");
  await expectHeading(page, "Criar regra");

  await page.goto("/rules");
  await expectHeading(page, "Regras");
});

test("jornada D - metas", async ({ page }) => {
  await page.goto("/goals");
  await expectHeading(page, "Metas");

  await page.goto("/ritual/monthly");
  await expectHeading(page, "Ritual Mensal");
});

test("telas complementares", async ({ page }) => {
  await page.goto("/uploads");
  await expectHeading(page, "Uploads");

  await page.goto("/duplicates");
  await expectHeading(page, "Comparar duplicatas");

  await page.goto("/transactions");
  await expectHeading(page, "Transações");

  await page.goto("/calendar/event");
  await expectHeading(page, "Detalhe do evento");

  await page.goto("/accounts");
  await expectHeading(page, "Contas");

  await page.goto("/insights");
  await expectHeading(page, "Insights");

  await page.goto("/settings");
  await expectHeading(page, "Configurações");

  await page.goto("/audit");
  await expectHeading(page, "Logs de Auditoria");
});
