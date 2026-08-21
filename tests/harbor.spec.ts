import { expect, test } from '@playwright/test'

test('loads the workspace and supports editor state changes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('harbor', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /New request/ }).first().click()
  await expect(page.locator('input[value="New request"]')).toBeVisible()
  await page.getByRole('button', { name: 'Headers 0' }).click()
  await page.getByRole('button', { name: 'Add header' }).click()
  await expect(page.getByPlaceholder('Header name')).toBeVisible()
  await page.getByRole('button', { name: 'Tests 0' }).click()
  await page.getByRole('button', { name: 'Add assertion' }).click()
  await expect(page.locator('input[value="status"]')).toBeVisible()
})
