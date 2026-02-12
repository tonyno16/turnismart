import { test, expect } from "@playwright/test";

test.describe("Scheduler", () => {
  test("can navigate to scheduler page", async ({ page }) => {
    await page.goto("/schedule");
    await expect(page.getByRole("heading", { name: "Programmazione" })).toBeVisible();
  });

  test("can navigate between weeks when week nav visible", async ({ page }) => {
    await page.goto("/schedule");
    await page.waitForLoadState("networkidle");
    const nextBtn = page.getByRole("button", { name: "→" });
    if (!(await nextBtn.isVisible())) {
      test.skip();
      return;
    }
    const weekLabel = page.locator("span").filter({ hasText: /–/ });
    const initialText = await weekLabel.first().textContent();

    await nextBtn.click();
    await page.waitForTimeout(500);
    const nextText = await weekLabel.first().textContent();
    expect(nextText).not.toBe(initialText);

    await page.getByRole("button", { name: "←" }).click();
    await page.waitForTimeout(500);
  });

  test("shows employee sidebar or empty state", async ({ page }) => {
    await page.goto("/schedule");
    await page.waitForLoadState("networkidle");
    const hasDragHint = await page.getByText("Trascina su una cella per assegnare").isVisible();
    const hasEmptyState =
      (await page.getByText("Aggiungi almeno un dipendente").isVisible()) ||
      (await page.getByText("Aggiungi almeno una sede").isVisible());
    expect(hasDragHint || hasEmptyState).toBeTruthy();
  });

  test("can publish schedule", async ({ page }) => {
    await page.goto("/schedule");
    const publishBtn = page.getByRole("button", { name: "Pubblica" });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      // Should show toast or status change
      await page.waitForTimeout(1000);
    }
  });
});
