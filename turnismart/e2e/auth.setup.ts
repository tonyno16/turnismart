import { test as setup, expect } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL!;
  const password = process.env.TEST_USER_PASSWORD!;

  await page.goto("/auth/login");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /accedi|login|sign in/i }).click();

  // Wait for redirect to dashboard after login (form POSTs to /api/auth/login → 303)
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Dashboard")).toBeVisible();

  // Save auth state
  await page.context().storageState({ path: authFile });
});
