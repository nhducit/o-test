/**
 * Playwright mocks for pwa-player embed E2E tests.
 *
 * Embed boot makes the following requests (see ai-plans/features/pwa-embed/
 * phase-3-implementation-plan.md):
 *   - GET  /config-dev.json                       — pwa-player resolves API_URL
 *   - WSS  wss://dev.personalisationhub.com/...   — device stream; sends
 *                                                   DEVICE.ASSIGNED with apikey
 *   - GET  /location-api/device/:id/playlists     — playlist + assets
 *   - GET  /location-api/device/:id               — device + display info
 *   - POST /location-analytics/events/ingest      — analytics batch
 *
 * The mocks stub all of these so Playwright tests can assert on observable
 * traffic (WS query params, REST calls, ingest payloads) without a live
 * backend.
 */
import type {
  BrowserContext,
  Frame,
  Page,
  Request,
  Route,
  WebSocketRoute,
} from '@playwright/test'

export const MOCK_API_ORIGIN = 'https://api.mock.local'

/** Default pwa-player URL. Override via PWA_PLAYER_URL. */
export const PWA_PLAYER_URL =
  process.env.PWA_PLAYER_URL ?? 'http://localhost:3008'

/** UUID v4-ish regex used by webStore.deviceId. */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface RecordedWS {
  url: URL
  ws: WebSocketRoute
}

interface RecordedIngest {
  url: string
  body: unknown
  request: Request
}

interface RecordedRest {
  url: string
  method: string
}

export interface MockBackend {
  ingestPosts: RecordedIngest[]
  websockets: RecordedWS[]
  restRequests: RecordedRest[]
  /** Wait for at least N ingest POSTs to /events/ingest. */
  waitForIngest(min?: number, timeoutMs?: number): Promise<void>
  /** Wait for at least N WS connections. */
  waitForWebSockets(min?: number, timeoutMs?: number): Promise<void>
}

/**
 * Install all mock routes on the given context. Apply BEFORE navigating so
 * iframes loading pwa-player have their requests intercepted from boot.
 */
export async function installMockBackend(
  context: BrowserContext,
): Promise<MockBackend> {
  const ingestPosts: RecordedIngest[] = []
  const websockets: RecordedWS[] = []
  const restRequests: RecordedRest[] = []

  // pwa-player fetches `${origin}${BASE_URL}/config-dev.json` on localhost
  // boot to resolve `apis.apiURL`. Point it at our mock origin.
  await context.route(/\/config-dev\.json$/, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ API_URL: MOCK_API_ORIGIN, SENTRY_DSN: '' }),
    })
  })

  // Catch-all for any /location-api or /location-analytics paths we don't
  // specifically mock — return 200 empty JSON to avoid uncaught network
  // errors that might short-circuit the boot. REGISTERED FIRST: Playwright
  // matches routes in REVERSE registration order, so the more specific
  // routes registered below override this fallback.
  await context.route(
    /\/location-(api|analytics)\//,
    async (route: Route) => {
      restRequests.push({
        url: route.request().url(),
        method: route.request().method(),
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: null }),
      })
    },
  )

  // Device info — minimum shape required by useGetDeviceInfo hook.
  await context.route(
    /\/location-api\/device\/[^/]+(\?.*)?$/,
    async (route: Route) => {
      const url = route.request().url()
      // Avoid catching the /playlists subpath; the playlist route is
      // registered AFTER this one (so it overrides).
      if (url.includes('/playlists')) {
        await route.fallback()
        return
      }
      restRequests.push({ url, method: route.request().method() })
      // Shape must satisfy `deviceInfoSchema` in
      // apps/pwa-player/src/types/apiDecoders.tsx — most display fields are
      // required, not nullish, so we have to supply them all even if zero.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            device: {
              id: 1,
              deviceId: 'mock-device',
              name: 'Mock Display',
              storeId: 'mock-store',
              type: 'digital-signage',
              deviceType: 'kiosk',
              associatedDisplayId: 'mock-display',
              digitalSignageState: 'active',
              intent: null,
              deviceEntities: null,
            },
            display: {
              id: 1,
              displayId: 'mock-display',
              displayName: 'Mock Screen',
              orientation: null,
              status: 'online',
              isOnline: true,
              timeout: 5000,
              primaryDuration: 10,
              interactionDuration: 5,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              triggerDialogflowRequestId: 0,
              dialogflowEnable: false,
              dialogflowEnableDisplay: false,
              dialogflowEnableVisitorDevice: false,
              storeplayEnable: false,
              tags: [],
              visitors: [],
              campaigns: [],
              displayChannelAssignments: null,
              qrcodeContent: null,
              triggerDialogflowRequest: { id: 0, isActive: false },
              virtualBeacon: null,
              zone: null,
              latestDiagnosticSessionId: null,
              latestDiagnosticSession: null,
              updatedPlaybackAt: null,
            },
            store: { id: 1, name: 'Mock Store', glbStoreCode: 'MS01' },
            displayType: {
              id: 'mock-dt',
              defaultPlaylistId: 'main-playlist',
              width: 1920,
              height: 1080,
              backgroundColor: '#000000',
              assetPositioningId: 'TOP_LEFT',
              assetFillModeId: 'COVER',
              campaignTransitionModeId: 'NONE',
              campaignAutoRotationModeId: 'ON',
              campaignAutoPlayModeId: 'ON',
              maximumCampaignsPlayedInRotation: -1,
              isPhantomAreaEnabled: false,
              isZonesEnabled: false,
              zones: [],
            },
          },
        }),
      })
    },
  )

  // Playlist payload — one always-on scheduling, one HTML campaign that
  // advances quickly so campaign_played fires without needing real video.
  await context.route(
    /\/location-api\/device\/[^/]+\/playlists/,
    async (route: Route) => {
      restRequests.push({
        url: route.request().url(),
        method: route.request().method(),
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'main-playlist',
              name: 'Main',
              assets: [
                {
                  id: 1,
                  assetType: 'IMAGE',
                  assetUrl: 'data:image/svg+xml;utf8,<svg/>',
                  campaignName: 'Mock Campaign 1',
                  campaignPlaybackDurationSec: 1,
                  campaignType: 'standard',
                  phCampaignId: 100,
                  priority: 1,
                  fileSizeBytes: 100,
                  uploadOutput: {},
                },
              ],
              schedulings: [
                {
                  id: 1,
                  name: 'Always On',
                  isEnabled: true,
                  touchPoints: [],
                  playlistIds: ['main-playlist'],
                  mode: 'always',
                  recurrenceRuleString: 'FREQ=DAILY',
                  startTime: '00:00',
                  startDateTimezoneIdentifier: 'UTC',
                  endTime: '23:59',
                  endDateTimezoneIdentifier: 'UTC',
                  endOn: null,
                  phCampaignId: 100,
                },
              ],
              storeOpeningHours: [],
              dynamicTargetings: [],
              staticTargetings: [100],
              activeCampaign: {
                id: 1,
                startedAt: '2020-01-01T00:00:00Z',
                endedAt: '2099-12-31T23:59:59Z',
              },
            },
          ],
        }),
      })
    },
  )

  // Analytics ingest — record and ack.
  await context.route(
    '**/location-analytics/events/ingest',
    async (route: Route) => {
      const request = route.request()
      let body: unknown = null
      try {
        body = request.postDataJSON()
      } catch {
        body = request.postData()
      }
      ingestPosts.push({ url: request.url(), body, request })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', total_received: 1 }),
      })
    },
  )

  // WebSocket — the embed sends device_type=embed (or pwa, behind feature
  // flag). On connect, immediately push DEVICE.ASSIGNED so the client moves
  // past registration and starts fetching playlists.
  await context.routeWebSocket(
    /\/location-stream\//,
    (ws: WebSocketRoute) => {
      const url = new URL(ws.url())
      websockets.push({ url, ws })

      // DEVICE.ASSIGNED carries the apikey the client uses for REST auth.
      // Embed mode also receives apiKey via URL param, but the WS message
      // is what flips `isRegisteredDevice` for non-embed paths and is
      // harmless in embed mode.
      ws.send(
        JSON.stringify({
          code: 'DEVICE.ASSIGNED',
          payload: {
            apikey: url.searchParams.get('apiKey') ?? 'mock-api-key',
          },
        }),
      )

      // Drop any subsequent client messages (pong, etc.) silently.
      ws.onMessage(() => {})
    },
  )

  const waitFor = async (
    name: string,
    predicate: () => boolean,
    timeoutMs: number,
  ) => {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (predicate()) return
      await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error(`Timed out waiting for ${name} after ${timeoutMs}ms`)
  }

  return {
    ingestPosts,
    websockets,
    restRequests,
    async waitForIngest(min = 1, timeoutMs = 15_000) {
      await waitFor(
        `${min} ingest POST(s)`,
        () => ingestPosts.length >= min,
        timeoutMs,
      )
    },
    async waitForWebSockets(min = 1, timeoutMs = 15_000) {
      await waitFor(
        `${min} websocket connection(s)`,
        () => websockets.length >= min,
        timeoutMs,
      )
    },
  }
}

/** Path to the local embed-host fixture for use with `file://` navigation. */
export function embedHostPath(): string {
  return require('path').resolve(__dirname, 'fixtures/embed-host.html')
}

/** Build a `file://` URL to the embed-host fixture with query params. */
export function embedHostUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString()
  return 'file://' + embedHostPath() + (qs ? '?' + qs : '')
}

// ---------------------------------------------------------------------------
// Mode-simulation helpers
// ---------------------------------------------------------------------------

export interface ChromeRuntimeStubOptions {
  deviceId?: string
}

/**
 * Inject a `window.chrome.runtime` shape sufficient for
 * `apps/pwa-player/src/utils/chromeExtensions.ts:isChromeRuntimeAvailable()`
 * to return true, plus a `sendMessage` stub returning canned responses keyed
 * off the request `action`. Apply BEFORE navigating.
 *
 * Without this, `getPlayerMode()` returns `'anonymous'` even when no
 * `?mode=embed` is present.
 */
export async function installChromeRuntime(
  context: BrowserContext,
  opts: ChromeRuntimeStubOptions = {},
): Promise<void> {
  const deviceId = opts.deviceId ?? 'chromebox-device-stub'
  await context.addInitScript((injectedDeviceId: string) => {
    const responses: Record<string, unknown> = {
      getDeviceId: { deviceId: injectedDeviceId },
      getDeviceAssetId: { assetId: 'stub-asset-id' },
      getDeviceSerialNumber: { serialNumber: 'stub-serial' },
      getNetworkDetails: { networkDetails: { ssid: 'stub-net' } },
      getDisplayInfo: { displayInfo: [{ id: 'stub' }] },
      getConfig: { config: {} },
    }
    ;(window as unknown as { chrome: unknown }).chrome = {
      runtime: {
        sendMessage: (
          _extensionId: string,
          message: { action?: string },
        ): Promise<unknown> =>
          Promise.resolve(
            responses[message?.action ?? ''] ?? { ok: true },
          ),
      },
    }
  }, deviceId)
}

/**
 * Spy on `navigator.mediaDevices.getUserMedia`. After install, read the call
 * count via `await page.evaluate(() => (window as any).__gumCalls)`.
 */
export async function installGetUserMediaSpy(
  context: BrowserContext,
): Promise<void> {
  await context.addInitScript(() => {
    const w = window as unknown as {
      __gumCalls: number
      __gumOriginal: unknown
    }
    w.__gumCalls = 0
    if (navigator.mediaDevices?.getUserMedia) {
      const original =
        navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
      w.__gumOriginal = original
      navigator.mediaDevices.getUserMedia = (
        ...args: Parameters<MediaDevices['getUserMedia']>
      ) => {
        w.__gumCalls += 1
        return original(...args)
      }
    }
  })
}

interface PersistedWebStore {
  deviceId: string
  displayId: string
  storeId: string
  apiKey: string
  isRegisteredDevice: boolean
  [k: string]: unknown
}

interface ParsedPersisted {
  key: string
  value: PersistedWebStore
}

/**
 * Wait until the embed sessionStorage key (`webStore-<uuid>`) appears with a
 * UUID `deviceId`. Returns the persisted record. Throws on timeout.
 */
export async function waitForEmbedBoot(
  scope: Page | Frame,
  timeoutMs = 10_000,
): Promise<ParsedPersisted> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const result = await scope.evaluate(() => {
      const key = Object.keys(sessionStorage).find((k) =>
        k.startsWith('webStore-'),
      )
      if (!key) return null
      const raw = sessionStorage.getItem(key)
      if (!raw) return null
      try {
        return { key, value: JSON.parse(raw) as Record<string, unknown> }
      } catch {
        return null
      }
    })
    if (
      result &&
      typeof result.value.deviceId === 'string' &&
      /^[0-9a-f-]{36}$/i.test(result.value.deviceId)
    ) {
      return result as ParsedPersisted
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`waitForEmbedBoot: no webStore-<uuid> after ${timeoutMs}ms`)
}

/**
 * Wait until non-embed boot has populated `localStorage.webStore` with a
 * non-empty `deviceId`. Used for chromebox tests; for anonymous, registration
 * never completes without a backend, so this will only resolve once the mock
 * backend's WS sends DEVICE.ASSIGNED — set a generous timeout or skip.
 */
export async function waitForNonEmbedBoot(
  page: Page,
  timeoutMs = 10_000,
): Promise<PersistedWebStore> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const result = await page.evaluate(() => {
      const raw = localStorage.getItem('webStore')
      if (!raw) return null
      try {
        return JSON.parse(raw) as Record<string, unknown>
      } catch {
        return null
      }
    })
    if (result && typeof result.deviceId === 'string' && result.deviceId) {
      return result as PersistedWebStore
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(
    `waitForNonEmbedBoot: localStorage.webStore.deviceId never set after ${timeoutMs}ms`,
  )
}

/** Return the names of all open IndexedDB databases for the page's origin. */
export async function getStoredIDBNames(scope: Page | Frame): Promise<string[]> {
  return scope.evaluate(async () => {
    if (typeof indexedDB.databases !== 'function') {
      return []
    }
    const dbs = await indexedDB.databases()
    return dbs.map((d) => d.name).filter((n): n is string => typeof n === 'string')
  })
}

/** Skip the test if pwa-player dev server is unreachable. */
export async function skipIfPlayerUnreachable(): Promise<string | null> {
  const { request: pwRequest } = await import('@playwright/test')
  const ctx = await pwRequest.newContext()
  try {
    const res = await ctx.get(PWA_PLAYER_URL, { timeout: 3000 })
    if (!res.ok()) {
      return `pwa-player at ${PWA_PLAYER_URL} returned ${res.status()}`
    }
    return null
  } catch (err) {
    return `pwa-player at ${PWA_PLAYER_URL} unreachable (${
      (err as Error).message
    })`
  } finally {
    await ctx.dispose()
  }
}
