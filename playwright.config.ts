import { defineConfig, devices } from '@playwright/test'

// env is loaded via ./env.ts which is imported by config.ts

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
        storageState: 'playwright/.auth/hq-admin-user.json',
      },
      dependencies: ['setup'],
    },
  ],
})
