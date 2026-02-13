import { test, expect } from "@playwright/test";
import { resetOnboardingE2e } from "../scripts/reset-onboarding-e2e";

/**
 * E2E: Onboarding → Schedule → Publish
 * Reset automatico prima dei test (onboarding_completed=false per utente E2E).
 * Usa lo stesso storageState del setup auth (TEST_USER_EMAIL).
 */
test.describe("Onboarding flow: 5 step → Schedule → Publish", () => {
  test.describe.configure({ mode: "serial" }); // stesso utente/org: evitare race

  test.beforeAll(async () => {
    await resetOnboardingE2e();
  });

  test.beforeEach(async ({ page }) => {
    // Vai a dashboard → redirect a onboarding
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("step 1: seleziona settore e continua", async ({ page }) => {
    const step1 = page.getByRole("heading", { name: /tipo di attività/i });
    await expect(step1).toBeVisible({ timeout: 10000 });
    await page.locator('label:has(input[value="ristorante"])').click();
    await page.getByRole("button", { name: /continua/i }).click();
    // Attendi transizione (server action + router.refresh)
    await expect(
      page.getByRole("heading", { name: /prima sede/i })
    ).toBeVisible({ timeout: 15000 });
  });

  test("completa onboarding e pubblica orario", async ({ page }) => {
    test.setTimeout(120000); // Flusso lungo: step 1-5 + schedule + publish
    // Step 1: potrebbe essere già completato (initialStep da dati esistenti)
    const step1Heading = page.getByRole("heading", { name: /tipo di attività/i });
    const step2Heading = page.getByRole("heading", { name: /prima sede/i });
    const step3Heading = page.getByRole("heading", { name: /fabbisogno/i });
    const step4Heading = page.getByRole("heading", { name: /primi dipendenti/i });

    if (await step1Heading.isVisible()) {
      await page.locator('label:has(input[value="ristorante"])').click();
      await page.getByRole("button", { name: /continua/i }).click();
      await expect(
        page.getByRole("heading", { name: /prima sede|fabbisogno|primi dipendenti|tutto pronto/i })
      ).toBeVisible({ timeout: 15000 });
    }

    if (await step2Heading.isVisible()) {
      await page.getByPlaceholder("es. Ristorante Centro").fill("Sede E2E Test");
      await page.getByRole("button", { name: /continua/i }).click();
      await expect(
        page.getByRole("heading", { name: /fabbisogno|primi dipendenti|tutto pronto/i })
      ).toBeVisible({ timeout: 15000 });
    }

    if (await step3Heading.isVisible()) {
      const firstNumberInput = page.locator('input[type="number"][min="0"]').first();
      await firstNumberInput.waitFor({ state: "visible", timeout: 10000 });
      await firstNumberInput.fill("1");
      await page.getByRole("button", { name: /continua/i }).click();
      await expect(
        page.getByRole("heading", { name: /primi dipendenti|tutto pronto/i })
      ).toBeVisible({ timeout: 15000 });
    }

    if (await step4Heading.isVisible()) {
      // Attendi caricamento ruoli (select con options)
      await page.locator("select option").first().waitFor({ state: "attached", timeout: 10000 });
      await page.getByPlaceholder("Mario").first().fill("Mario");
      await page.getByPlaceholder("Rossi").first().fill("Rossi");
      await page.getByRole("button", { name: /continua/i }).click();
      await expect(
        page.getByRole("heading", { name: /tutto pronto/i })
      ).toBeVisible({ timeout: 15000 });
    }

    // Step 5
    await expect(page.getByRole("heading", { name: /tutto pronto/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /inizia a creare orari/i }).click();

    // Redirect a dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Vai a schedule
    await page.goto("/schedule");
    await expect(page).toHaveURL(/\/schedule/);
    await expect(page.getByRole("heading", { name: "Programmazione" })).toBeVisible();

    // Genera con AI se visibile (opzionale: può fallire per quota API 429)
    const aiButton = page.getByRole("button", { name: /genera con ai|ai/i });
    if (await aiButton.isVisible()) {
      await aiButton.click();
      const modal = page.getByRole("heading", { name: /genera con ai/i });
      await expect(modal).toBeVisible();
      await page.getByRole("button", { name: /genera|avvia/i }).click();
      // Attendi esito: successo O errore (429 quota, ecc.) per poi chiudere
      await expect(
        page.getByText(/completato|turni assegnati|salvati|429|quota|exceeded|errore/i)
      ).toBeVisible({ timeout: 30000 });
      await page.getByRole("button", { name: /chiudi|close/i }).click();
    }

    // Pubblica
    const publishBtn = page.getByRole("button", { name: "Pubblica" });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await expect(page.getByText(/orario pubblicato|pubblicato/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
