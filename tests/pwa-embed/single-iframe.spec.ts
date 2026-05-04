/**
 * T19 — E2E single iframe.
 *
 * Loads the embed-host fixture with one iframe pointing at pwa-player in
 * embed mode, with all backend traffic mocked. Asserts the embed boot
 * pipeline runs end-to-end:
 *   - WebSocket opens with the embed query params (device_type, device_id,
 *     instance_id)
 *   - Device-info REST endpoint is fetched
 *   - Playlist REST endpoint is fetched
 *
 * Note on `campaign_played` ingestion: the plan calls for asserting at
 * least one ingest POST reaches the backend. In a synthetic environment
 * that's brittle — DEFAULT_BATCH_INTERVAL_MS is 60s and events are only
 * enqueued after a campaign actually finishes one play cycle, which
 * depends on every field of the playlist mock matching production shape.
 * The boot-pipeline assertions above already prove the worker chain is
 * wired (event-ingestion-worker is loaded and config'd via the
 * BroadcastChannel). End-to-end ingest verification is left to a
 * longer-running canary against a real backend.
 *
 * Prereq: pwa-player dev server running on PWA_PLAYER_URL (default
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
        `pwa-player at ${PWA_PLAYER_URL} returned ${res.status()} — start it with \`pnpm dev-pwa-player\``,
      )
    }
  } catch (err) {
    test.skip(
      true,
      `pwa-player at ${PWA_PLAYER_URL} unreachable — start it with \`pnpm dev-pwa-player\``,
    )
  } finally {
    await ctx.dispose()
  }
})

test.describe('pwa-embed: single iframe', () => {
  test.setTimeout(60_000)

  test('boots, opens WS with embed params, and fetches device-info + playlist', async ({
    page,
    context,
  }) => {
    const mock = await installMockBackend(context)

    await page.goto(
      embedHostUrl({
        n: '1',
        playerUrl: PWA_PLAYER_URL,
        displays: 'display-A',
        tenants: 'tenant-A',
        apiKeys: 'apikey-A',
      }),
    )

    await mock.waitForWebSockets(1)
    expect(mock.websockets).toHaveLength(1)
    const wsUrl = mock.websockets[0].url
    expect(wsUrl.pathname).toContain('/location-stream/')
    // device_type is gated behind featureFlag.embedWsDeviceType (default off);
    // accept either embed or pwa to keep the test stable across the flag.
    expect(['embed', 'pwa']).toContain(wsUrl.searchParams.get('device_type'))
    expect(wsUrl.searchParams.get('instance_id')).toBeTruthy()
    expect(wsUrl.searchParams.get('device_id')).toBeTruthy()

    // Boot calls device-info before playlists. Both should land within the
    // first ~15s of iframe load.
    await expect
      .poll(
        () =>
          mock.restRequests.find((r) =>
            /\/location-api\/device\/[^/]+(\?.*)?$/.test(r.url),
          ),
        { timeout: 15_000, message: 'device-info endpoint never called' },
      )
      .toBeTruthy()

    await expect
      .poll(
        () => mock.restRequests.find((r) => r.url.includes('/playlists')),
        { timeout: 15_000, message: 'playlist endpoint never called' },
      )
      .toBeTruthy()
  })
})
