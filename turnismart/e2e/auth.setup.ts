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

  // Wait for redirect after login: dashboard (se onboarding completato) o onboarding
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  await expect(
    page.getByText(/Dashboard|Configura la tua attività/i)
  ).toBeVisible();

  // Save auth state
  await page.context().storageState({ path: authFile });
});
