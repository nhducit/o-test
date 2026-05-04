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
  Request,
  Route,
  WebSocketRoute,
} from '@playwright/test'

export const MOCK_API_ORIGIN = 'https://api.mock.local'

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
