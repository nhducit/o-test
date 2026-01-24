import { test as setup, expect } from '@playwright/test'
import { authFile, app } from '../config'
import fs from 'fs'
import { env } from '../env'

const isTokenExpired = (data: { origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }> }): boolean => {
  if (!data?.origins?.length) {
    return true
  }

  for (const origin of data.origins) {
    const tokenEntry = origin.localStorage?.find((item) => {
      return item.name.includes('token') || item.name.includes('auth')
    })

    if (tokenEntry) {
      try {
        // Try to parse as JWT and check expiration
        const payload = JSON.parse(atob(tokenEntry.value.split('.')[1]))
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return true
        }
      } catch {
        // If not a JWT, fall back to file age check
        continue
      }
    }
  }

  // Fall back to checking file modification time (expire after 23 hours)
  const stats = fs.statSync(authFile.hqAdmin)
  const fileAgeMs = Date.now() - stats.mtimeMs
  const maxAgeMs = 23 * 60 * 60 * 1000
  return fileAgeMs > maxAgeMs
}

setup('authenticate HQ Admin', async ({ page }) => {
  const isFileExists = fs.existsSync(authFile.hqAdmin)
  const data = isFileExists
    ? JSON.parse(fs.readFileSync(authFile.hqAdmin, 'utf8'))
    : null

  if (data && data.origins?.length > 0 && !isTokenExpired(data)) {
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
