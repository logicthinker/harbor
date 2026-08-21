import { test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('has no serious or critical axe accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
  if (serious.length) throw new Error(serious.map((violation) => `${violation.id}: ${violation.help}\n${violation.nodes.map((node) => node.target.join(' ')).join('\n')}`).join('\n'))
})
