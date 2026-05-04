import { defineConfig, devices } from '@playwright/test'
import { authFile } from './config'

export default defineConfig({
  timeout: process.env.NODE_ENV === 'development' ? 60000 : 30000,
  expect: {
    timeout: 5000,
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
      testIgnore: /tests\/pwa-embed\/.*/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile.hqAdmin,
      },
      dependencies: ['setup'],
    },
    {
      // pwa-player embed E2E tests run iframes inside a local file:// host
      // page with all backend traffic mocked. They don't need HQ Admin auth
      // and must not depend on the auth setup project.
      name: 'pwa-embed',
      testDir: './tests/pwa-embed',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
})
