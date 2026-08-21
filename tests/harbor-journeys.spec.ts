import { expect, test } from '@playwright/test'

test.describe('Harbor user journeys and resilience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('harbor', { exact: true })).toBeVisible()
  })

  test('configures a request, runs it, inspects response data, and changes workspace preferences', async ({ page }) => {
    await page.route('**/v1/health', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', service: 'test' }) }))
    await page.getByRole('button', { name: 'Authorization' }).click()
    await page.locator('.auth-form select').selectOption('basic')
    await page.getByRole('button', { name: 'Headers 0' }).click()
    await page.getByRole('button', { name: /Add header/ }).click()
    await page.locator('input[placeholder="Header name"]').fill('X-Test')
    await page.locator('input[placeholder="Header value"]').fill('journey')
    await page.getByRole('button', { name: 'Tests 1' }).click()
    await page.getByRole('button', { name: /Add assertion/ }).click()
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('200 OK')).toBeVisible()
    await page.getByRole('button', { name: 'Timeline' }).click()
    await expect(page.getByText('DNS lookup')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(page.locator('.app-shell.light-theme')).toBeVisible()
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByText('Harbor settings')).toBeVisible()
    await page.locator('.settings-overlay').click({ position: { x: 5, y: 5 } })
    await expect(page.getByText('Harbor settings')).not.toBeVisible()
    await page.getByRole('button', { name: 'Open in split view' }).click()
    await expect(page.locator('.app-shell.split-view')).toBeVisible()
  })

  test('shows a useful failure state for network errors', async ({ page }) => {
    await page.route('**/v1/health', async (route) => route.abort('failed'))
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText(/Request failed/)).toBeVisible()
  })

  test('has accessible names for interactive controls and renders within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()
    const unnamed = await page.locator('button:not(.icon-button), input:not([type="hidden"]):not([hidden]), select, textarea').evaluateAll((elements) => elements.filter((element) => {
      const labelled = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent?.trim() || (element as HTMLInputElement).placeholder
      return !labelled
    }).map((element) => ({ tag: element.tagName, className: element.className, value: (element as HTMLInputElement).value })))
    expect(unnamed).toHaveLength(0)
    expect(await page.locator('button.icon-button').count()).toBeGreaterThan(0)
    expect(await page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth + 1)).toBeTruthy()
  })

  test('loads the first meaningful screen within a reasonable budget', async ({ page }) => {
    const paint = await page.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0)
    expect(paint).toBeGreaterThan(0)
    expect(paint).toBeLessThan(20000)
    await expect(page.locator('.workspace')).toBeVisible()
  })
})
