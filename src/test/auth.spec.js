// tests/auth.spec.js
import { test, expect } from '@playwright/test';

const TEST_USERS = {
  valid: {
    email: 'admin@leadcap.ng',
    password: 'admin123!',
  },
  invalid: {
    email: 'admi@leadcap.ng',
    password: 'admin123',
  },
};

async function fillLoginForm(page, email, password) {
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
}

async function submitLogin(page) {
  await page.getByRole('button', { name: /login|sign in/i }).click();
}

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /login|sign in/i })
    ).toBeVisible();
  });

  test('user cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/');

    await fillLoginForm(
      page,
      TEST_USERS.invalid.email,
      TEST_USERS.invalid.password
    );
    await submitLogin(page);

    // Adjust this depending on your real UI text
    await expect(page.locator('body')).toContainText(
      /invalid|incorrect|failed|error|Invalid credentials/i
    );
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/');

    await fillLoginForm(
      page,
      TEST_USERS.valid.email,
      TEST_USERS.valid.password
    );
    await submitLogin(page);

    // Adjust based on your actual redirect route
    await expect(page).toHaveURL(/invitecodes/i);
  });
});