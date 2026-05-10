/**
 * TS1 — Mode detection & boot.
 *
 * Verifies `apps/pwa-player/src/utils/mode.ts:getPlayerMode()` correctly
 * branches on `?mode=embed` (embed) vs `chrome.runtime` presence
 * (chromebox) vs neither (anonymous), and that each branch wires its own
 * persistence shape (storage backend + key namespacing).
 *
 * See ai-plans/features/pwa-embed/automation-test-plan.md.
 */
import { test, expect } from '@playwright/test'
import {
  PWA_PLAYER_URL,
  UUID_RE,
  embedHostUrl,
  installChromeRuntime,
  installMockBackend,
  skipIfPlayerUnreachable,
  waitForEmbedBoot,
} from './mocks'

test.beforeAll(async () => {
  const reason = await skipIfPlayerUnreachable()
  if (reason) {
    test.skip(true, `${reason} — start pwa-player with \`pnpm dev-pwa-player\``)
  }
})

test.describe('pwa-embed: TS1 mode detection & boot', () => {
  test.setTimeout(60_000)

  test('embed boot persists webStore-<uuid> in sessionStorage with URL params', async ({
    page,
    context,
  }) => {
    await installMockBackend(context)
    await page.goto(
      embedHostUrl({
        n: '1',
        playerUrl: PWA_PLAYER_URL,
        displays: 'display-A',
        tenants: 'tenant-A',
        apiKeys: 'apikey-A',
      }),
    )

    // The host fixture is file://, the iframe is http://localhost:3008 →
    // cross-origin, so we can't read iframe.contentDocument from the host.
    // Instead poll page.frames() for the embed-mode iframe to appear.
    let iframeFrame: import('@playwright/test').Frame | undefined
    const start = Date.now()
    while (Date.now() - start < 15_000) {
      iframeFrame = page.frames().find((f) => f.url().includes('mode=embed'))
      if (iframeFrame) break
      await page.waitForTimeout(100)
    }
    expect(iframeFrame, 'embed iframe should exist').toBeTruthy()

    const persisted = await waitForEmbedBoot(iframeFrame!)
    // Both UUIDs but NOT equal: the storage key suffix is `instanceId`
    // (mode.ts:24, generated via crypto.randomUUID()) and `deviceId` is
    // generated separately via `uuid()` in webStore.tsx:111. Assert each is
    // a UUID; do not assert equality (the manual spec previously claimed
    // these are equal — they are not).
    expect(persisted.key).toMatch(/^webStore-[0-9a-f-]{36}$/i)
    const keySuffix = persisted.key.replace(/^webStore-/, '')
    expect(keySuffix).toMatch(UUID_RE)
    expect(persisted.value.deviceId).toMatch(UUID_RE)
    expect(persisted.value.apiKey).toBe('apikey-A')
    expect(persisted.value.displayId).toBe('display-A')
    // tenantId param persists as storeId per stores/webStore.tsx:117.
    expect(persisted.value.storeId).toBe('tenant-A')
    expect(persisted.value.isRegisteredDevice).toBe(true)

    // Embed should not show registration screen.
    await expect(
      iframeFrame!.locator('text=Register this display'),
    ).toHaveCount(0)
  })

  test('anonymous boot redirects to /player-register and shows the 6-digit code', async ({
    page,
    context,
  }) => {
    await installMockBackend(context)
    await page.goto(`${PWA_PLAYER_URL}/app/`)

    await expect(page).toHaveURL(/\/player-register/, { timeout: 10_000 })
    await expect(
      page.locator('[data-testid="register-display-code"]'),
    ).toBeVisible({ timeout: 10_000 })

    // Anonymous uses localStorage with the bare key. webStore should exist
    // (Solid persisted store creates it on first interaction) but with
    // isRegisteredDevice still false.
    const stored = await page.evaluate(() => localStorage.getItem('webStore'))
    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.isRegisteredDevice).toBe(false)
    }
    // Embed-shaped sessionStorage must NOT appear.
    const sessionKeys = await page.evaluate(() =>
      Object.keys(sessionStorage).filter((k) => k.startsWith('webStore-')),
    )
    expect(sessionKeys).toEqual([])
  })

  test('chromebox boot uses bare webStore key in localStorage (no UUID suffix)', async ({
    page,
    context,
  }) => {
    await installChromeRuntime(context, { deviceId: 'chromebox-stub-123' })
    await installMockBackend(context)
    await page.goto(`${PWA_PLAYER_URL}/app/`)

    // initDeviceId() in chromebox calls getDeviceIdFromExtension() and sets
    // store.deviceId to the returned value. Wait for that.
    await expect
      .poll(
        async () => {
          const raw = await page.evaluate(() =>
            localStorage.getItem('webStore'),
          )
          if (!raw) return null
          try {
            return JSON.parse(raw).deviceId
          } catch {
            return null
          }
        },
        { timeout: 10_000, message: 'chromebox deviceId never set' },
      )
      .toBe('chromebox-stub-123')

    // sessionStorage should NOT have the embed-suffixed key.
    const sessionKeys = await page.evaluate(() =>
      Object.keys(sessionStorage).filter((k) => k.startsWith('webStore-')),
    )
    expect(sessionKeys).toEqual([])
  })

  test('mode=foo falls through to anonymous (treated like no mode param)', async ({
    page,
    context,
  }) => {
    await installMockBackend(context)
    await page.goto(`${PWA_PLAYER_URL}/app/?mode=foo`)
    // getPlayerMode() requires exact `mode=embed`; anything else → anonymous.
    await expect(page).toHaveURL(/\/player-register/, { timeout: 10_000 })
    const sessionKeys = await page.evaluate(() =>
      Object.keys(sessionStorage).filter((k) => k.startsWith('webStore-')),
    )
    expect(sessionKeys).toEqual([])
  })
})
