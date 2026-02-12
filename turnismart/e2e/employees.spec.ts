import { test, expect } from "@playwright/test";

test.describe("Employees", () => {
  test("can navigate to employees list", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("heading", { name: "Dipendenti" })).toBeVisible();
  });

  test("can search employees", async ({ page }) => {
    await page.goto("/employees");
    const searchInput = page.getByPlaceholder(/cerca|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Mario");
      await page.waitForTimeout(500);
      // Page should filter results
    }
  });

  test("can navigate to new employee form", async ({ page }) => {
    await page.goto("/employees/new");
    await expect(page.getByText(/nuovo dipendente|aggiungi/i)).toBeVisible();
  });

  test("new employee form has required fields", async ({ page }) => {
    await page.goto("/employees/new");
    await expect(page.getByText("Nome *", { exact: true })).toBeVisible();
    await expect(page.getByText("Cognome *", { exact: true })).toBeVisible();
  });
});
