import { test, expect, type Page } from "@playwright/test";

const expectHeading = async (page: Page, name: string) => {
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
};

test("jornada A - primeiro uso", async ({ page }) => {
  await page.goto("/onboarding/boas-vindas");
  await expect(page).toHaveURL(/onboarding\/boas-vindas/);
  await expect(page.getByText("Bem-vindos ao Budget Coach")).toBeVisible();

  await page.goto("/onboarding/categorias");
  await expectHeading(page, "Vamos personalizar seu orcamento");

  await page.goto("/onboarding/orcamentos");
  await expectHeading(page, "Defina orcamentos por categoria");

  await page.goto("/onboarding/ritual");
  await expectHeading(page, "Ritual semanal com o casal");

  await page.goto("/onboarding/importar");
  await expectHeading(page, "Primeiro import");

  await page.goto("/dashboard");
  await expectHeading(page, "Painel mensal");

  await page.goto("/confirmar");
  await expectHeading(page, "Fila de confirmacao");
});

test("jornada B - semanal", async ({ page }) => {
  await page.goto("/dashboard");
  await expectHeading(page, "Painel mensal");

  await page.goto("/confirmar");
  await expectHeading(page, "Fila de confirmacao");

  await page.goto("/ritual/semanal");
  await expectHeading(page, "Ritual semanal");

  await page.goto("/calendario");
  await expectHeading(page, "Calendario");

  await page.goto("/dashboard");
  await expectHeading(page, "Painel mensal");
});

test("jornada C - criar regra", async ({ page }) => {
  await page.goto("/confirmar");
  await expectHeading(page, "Fila de confirmacao");

  await page.goto("/rules/nova");
  await expectHeading(page, "Criar regra");

  await page.goto("/rules");
  await expectHeading(page, "Regras");
});

test("jornada D - metas", async ({ page }) => {
  await page.goto("/metas");
  await expectHeading(page, "Metas");

  await page.goto("/ritual/mensal");
  await expectHeading(page, "Ritual mensal");

  await page.goto("/dashboard");
  await expectHeading(page, "Painel mensal");
});

test("telas complementares", async ({ page }) => {
  await page.goto("/uploads");
  await expectHeading(page, "Importar transacoes");

  await page.goto("/uploads/detalhe");
  await expectHeading(page, "Detalhe do upload");

  await page.goto("/uploads/revisar-ocr");
  await expectHeading(page, "Revisar OCR");

  await page.goto("/confirmar/duplicatas");
  await expectHeading(page, "Comparar duplicatas");

  await page.goto("/transactions");
  await expectHeading(page, "Transacoes");

  await page.goto("/transactions/detalhe");
  await expectHeading(page, "Detalhe da transacao");

  await page.goto("/calendario/evento");
  await expectHeading(page, "Detalhe do evento");

  await page.goto("/contas");
  await expectHeading(page, "Contas");

  await page.goto("/insights");
  await expectHeading(page, "Insights");

  await page.goto("/orcamento");
  await expectHeading(page, "Orcamento");

  await page.goto("/settings");
  await expectHeading(page, "Configuracoes");

  await page.goto("/logs");
  await expectHeading(page, "Logs");
});
