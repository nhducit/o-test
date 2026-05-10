/**
 * TS6 + TS7 — Storage isolation: in-memory DB routing in embed vs IDB
 * routing in chromebox.
 *
 * Source:
 *   - apps/pwa-player/src/utils/pwaPlayerDBSelector.ts (T6)
 *   - apps/pwa-player/src/utils/event-queue-memory.ts (T7)
 *   - apps/pwa-player/src/utils/indexDBWorker.ts (phase-2 URL-based render)
 *
 * Embed mode:
 *   - No `pwa-player` IndexedDB created
 *   - No `pwa-event-queue` IndexedDB created
 *   - Campaign assets render with the CDN URL directly (not blob:)
 *
 * Chromebox mode:
 *   - Both `pwa-player` and `pwa-event-queue` DBs are created
 */
import { test, expect } from '@playwright/test'
import {
  PWA_PLAYER_URL,
  embedHostUrl,
  getStoredIDBNames,
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

test.describe('pwa-embed: TS7 in-memory DB routing (embed)', () => {
  test.setTimeout(90_000)

  test('embed: indexedDB.databases() omits pwa-player and pwa-event-queue', async ({
    page,
    context,
  }) => {
    await installMockBackend(context)
    await page.goto(
      embedHostUrl({
        n: '1',
        playerUrl: PWA_PLAYER_URL,
        displays: 'D-IDB',
        tenants: 'T-IDB',
        apiKeys: 'K-IDB',
      }),
    )
    const frame = page
      .frames()
      .find((f) => f.url().includes('mode=embed'))!
    await waitForEmbedBoot(frame)

    // Wait long enough for worker INIT + at least one playlist cycle.
    await page.waitForTimeout(15_000)

    const dbNames = await getStoredIDBNames(frame)
    expect(dbNames).not.toContain('pwa-player')
    expect(dbNames).not.toContain('pwa-event-queue')
  })

  test('embed: no asset element ever has a blob: src (URL-based render)', async ({
    page,
    context,
  }) => {
    await installMockBackend(context)
    await page.goto(
      embedHostUrl({
        n: '1',
        playerUrl: PWA_PLAYER_URL,
        displays: 'D-URL',
        tenants: 'T-URL',
        apiKeys: 'K-URL',
      }),
    )
    const frame = page
      .frames()
      .find((f) => f.url().includes('mode=embed'))!
    await waitForEmbedBoot(frame)

    // Let playback engine settle. With a mock playlist the first render may
    // not always reach DOM (decoder strictness, image type), so we assert
    // the *negative* invariant: NO blob: src ever appears in the embed
    // iframe regardless of whether anything renders.
    await page.waitForTimeout(15_000)

    // Only count blob: URLs on campaign asset elements. The
    // EmptyPlaylistScreen (rendered when no current item) creates a blob URL
    // for the client logo via `new URL.createObjectURL`; that's unrelated to
    // the embed URL-based-render contract for *campaign* assets.
    const blobSources = await frame.evaluate(() => {
      const selectors = [
        '[data-testid="campaign-render"] img',
        '[data-testid="campaign-render"] video',
        '[data-testid="campaign-render"] source',
        '[data-testid="campaign-asset-image"]',
        '[data-testid="campaign-asset-video"]',
      ]
      const els = selectors.flatMap((sel) =>
        Array.from(document.querySelectorAll(sel)),
      ) as Array<HTMLImageElement | HTMLVideoElement | HTMLSourceElement>
      return els
        .map((el) => el.getAttribute('src') ?? '')
        .filter((src) => src.startsWith('blob:'))
    })
    expect(
      blobSources,
      `embed mode must not produce blob: campaign asset URLs; found ${blobSources.length}`,
    ).toEqual([])
  })
})

test.describe('pwa-embed: TS7 IDB regression (chromebox)', () => {
  test.setTimeout(60_000)

  test('chromebox: pwa-player IDB is created at boot', async ({
    page,
    context,
  }) => {
    await installChromeRuntime(context, { deviceId: 'cb-idb-stub' })
    await installMockBackend(context)
    await page.goto(`${PWA_PLAYER_URL}/app/`)

    // Workers boot from WorkerProvider regardless of registration state.
    // Wait for the pwa-player DB to materialize. (`pwa-event-queue` is
    // created lazily on the first event enqueue — see
    // apps/pwa-player/src/utils/event-queue-db.ts:14 — and so is not a
    // reliable smoke signal; covered indirectly by event-collector tests.)
    await expect
      .poll(async () => (await getStoredIDBNames(page)).includes('pwa-player'), {
        timeout: 30_000,
        message: 'pwa-player IDB never created in chromebox',
      })
      .toBe(true)
  })
})
