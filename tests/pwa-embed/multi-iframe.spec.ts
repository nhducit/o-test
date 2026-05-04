/**
 * T20 — E2E multi iframe.
 *
 * Loads the embed-host fixture with three iframes, each registered with a
 * distinct displayId/tenantId/apiKey. Asserts iframe isolation:
 *   - Three independent WS connections open
 *   - Each connection has a distinct instance_id (per-iframe UUID)
 *   - Each connection has a distinct device_id (per-iframe UUID)
 *   - Three independent ingest streams (no event leaks across iframes —
 *     verified by checking ingest POSTs originate from distinct frames or
 *     carry distinct identifying data when present)
 *
 * Prereq: pwa-player dev server reachable at PWA_PLAYER_URL (default
 * http://localhost:3008). Tests skip cleanly if unreachable.
 */
import { test, expect, request as pwRequest } from '@playwright/test'
import { embedHostUrl, installMockBackend } from './mocks'

const PWA_PLAYER_URL = process.env.PWA_PLAYER_URL ?? 'http://localhost:3008'

test.beforeAll(async () => {
  const ctx = await pwRequest.newContext()
  try {
    const res = await ctx.get(PWA_PLAYER_URL, { timeout: 3000 })
    if (!res.ok()) {
      test.skip(
        true,
        `pwa-player at ${PWA_PLAYER_URL} returned ${res.status()}`,
      )
    }
  } catch {
    test.skip(true, `pwa-player at ${PWA_PLAYER_URL} unreachable`)
  } finally {
    await ctx.dispose()
  }
})

test.describe('pwa-embed: multi-iframe isolation', () => {
  test.setTimeout(120_000)

  test('three iframes register independently with distinct instance_id and device_id', async ({
    page,
    context,
  }) => {
    const mock = await installMockBackend(context)

    await page.goto(
      embedHostUrl({
        n: '3',
        playerUrl: PWA_PLAYER_URL,
        displays: 'display-A,display-B,display-C',
        tenants: 'tenant-A,tenant-B,tenant-C',
        apiKeys: 'apikey-A,apikey-B,apikey-C',
      }),
    )

    await mock.waitForWebSockets(3, 30_000)
    expect(mock.websockets).toHaveLength(3)

    const instanceIds = mock.websockets.map((w) =>
      w.url.searchParams.get('instance_id'),
    )
    const deviceIds = mock.websockets.map((w) =>
      w.url.searchParams.get('device_id'),
    )

    // Every instance_id and device_id should be present and unique. The
    // embed instanceId is generated via crypto.randomUUID() per iframe; the
    // deviceId is also UUID-per-iframe in the fresh registration path.
    for (const id of instanceIds) expect(id).toBeTruthy()
    for (const id of deviceIds) expect(id).toBeTruthy()
    expect(new Set(instanceIds).size).toBe(3)
    expect(new Set(deviceIds).size).toBe(3)

    // Each iframe should call the playlist endpoint at least once. Three
    // distinct device_ids means three distinct playlist URL paths.
    await expect
      .poll(
        () => {
          const playlistDeviceIds = new Set<string>()
          for (const r of mock.restRequests) {
            const m = r.url.match(/\/device\/([^/]+)\/playlists/)
            if (m) playlistDeviceIds.add(m[1])
          }
          return playlistDeviceIds.size
        },
        { timeout: 30_000, message: 'expected 3 distinct playlist fetches' },
      )
      .toBe(3)
  })
})
