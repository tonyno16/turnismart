import { test, expect } from "@playwright/test";

/**
 * Full flow E2E: login → dashboard → schedule → publish
 * Requires authenticated user (auth.setup) with org that has locations + employees.
 */
test.describe("Full flow: Dashboard → Schedule → Publish", () => {
  test("logged-in user can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("can navigate to schedule and see scheduler", async ({ page }) => {
    await page.goto("/schedule");
    await expect(page).toHaveURL(/\/schedule/);
    await expect(page.getByRole("heading", { name: "Programmazione" })).toBeVisible();
  });

  test("schedule page shows content or empty state", async ({ page }) => {
    await page.goto("/schedule");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Programmazione" })).toBeVisible();
    const hasWeekNav = await page.getByRole("button", { name: "→" }).isVisible();
    const hasEmptyState =
      (await page.getByText("Aggiungi almeno un dipendente").isVisible()) ||
      (await page.getByText("Aggiungi almeno una sede").isVisible());
    expect(hasWeekNav || hasEmptyState).toBeTruthy();
  });

  test("can open locations page", async ({ page }) => {
    await page.goto("/locations");
    await expect(page).toHaveURL(/\/locations/);
    await expect(page.getByRole("heading", { name: "Sedi" })).toBeVisible();
  });

  test("can open employees page", async ({ page }) => {
    await page.goto("/employees");
    await expect(page).toHaveURL(/\/employees/);
    await expect(page.getByRole("heading", { name: "Dipendenti" })).toBeVisible();
  });

  test("can open profile", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
  });

  test("can publish schedule when publish button visible", async ({ page }) => {
    await page.goto("/schedule");
    await page.waitForLoadState("networkidle");
    const publishBtn = page.getByRole("button", { name: "Pubblica" });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await expect(page.getByText(/orario pubblicato|pubblicato/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
