import { test as setup, expect } from '@playwright/test'
import { authFile, app } from '../config'
import fs from 'fs'
import { env } from '../env'

setup('authenticate HQ Admin', async ({ page }) => {
  const isFileExists = fs.existsSync(authFile.hqAdmin)
  const data = isFileExists
    ? JSON.parse(fs.readFileSync(authFile.hqAdmin, 'utf8'))
    : null

  if (data && data.origins?.length > 0) {
    return
  }

  await page.goto(`${app.hqAdmin}/login`)
  await page.locator('input[name="email"]').fill(env.HQ_ADMIN_AUTH_EMAIL)
  await page.locator('input[name="password"]').fill(env.HQ_ADMIN_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Stores / Branches').first()).toBeVisible()

  // Set feature flags in localStorage
  await page.evaluate(() => {
    localStorage.setItem('hq-admin.campaignAi', 'true')
  })

  await page.context().storageState({ path: authFile.hqAdmin })
})
