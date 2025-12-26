import path from "path";
import { expect, test } from "@playwright/test";

test.describe("import smoke", () => {
  test("navigates through the import flow", async ({ page }) => {
    await page.goto("/dashboard");
    const importButton = page.getByRole("button", { name: /Importar CSV/i }).first();
    try {
      await importButton.waitFor({ state: "visible", timeout: 2000 });
      await importButton.click();
    } catch {
      await page.goto("/import");
    }

    const sampleFile = path.join(__dirname, "../Sample_transaction_import/sample.csv");
    await page.locator('input[type="file"]').setInputFiles(sampleFile);
    await page.getByRole("button", { name: /Confirmar importação/i }).click();

    await page.waitForTimeout(2500);
    await page.getByRole("link", { name: /Ver transações/i }).click();
    await expect(page.getByRole("heading", { name: /Transações/i })).toBeVisible();
  });
});
