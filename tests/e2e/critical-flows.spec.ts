import { test, expect } from '@playwright/test';

test('admin lands on dashboard after login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('admin@acme.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL(/\/dashboard/);
  await expect(page.getByText('Dashboard')).toBeVisible();
});

test('member creates a record and admin approves it', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('member@acme.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL(/\/dashboard/);
  await page.goto('/requests/new');
  await page.getByLabel('Title').fill('E2E Laptop Request');
  await page.getByLabel('Description').fill('Requesting laptops for the team.');
  await page.getByRole('button', { name: /submit record/i }).click();

  await page.waitForURL(/\/requests/);
  await page.getByText('E2E Laptop Request').first().click();
  await page.getByRole('button', { name: /logout/i }).click();

  await page.waitForURL(/\/login/);
  await page.getByLabel('Email Address').fill('admin@acme.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto('/requests');
  await page.getByText('E2E Laptop Request').first().click();
  await page.getByRole('button', { name: /approve/i }).click();

  await expect(page.getByTestId('request-status')).toContainText('APPROVED');
});
