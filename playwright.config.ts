import { defineConfig, devices } from '@playwright/test'
import { authFile } from './config'

export default defineConfig({
  timeout: process.env.NODE_ENV === 'development' ? 100000 : 60000,
  expect: {
    timeout: 10000,
  },
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts$/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile.hqAdmin,
      },
      dependencies: ['setup'],
    },
  ],
})
