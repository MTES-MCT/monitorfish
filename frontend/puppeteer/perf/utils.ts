import puppeteer, { type Browser, type HTTPRequest, type Page } from 'puppeteer'

export const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:3000'

// Non-super-user seeded in `infra/dev/keycloak/realm-monitor-dev.json`
const USERNAME = process.env.PERF_USERNAME ?? 'user'
const PASSWORD = process.env.PERF_PASSWORD ?? 'fish'

export async function launchChrome(): Promise<Browser> {
  return puppeteer.launch({
    args: ['--no-proxy-server', '--window-size=1400,900'],
    channel: 'chrome',
    defaultViewport: { height: 900, width: 1400 },
    headless: process.env.IS_HEADLESS !== 'false'
  })
}

export async function login(page: Page): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: 'load' })
  await page.locator('button ::-p-text(ProConnect)').click()
  await page.waitForSelector('#username')
  await page.type('#username', USERNAME)
  await page.type('#password', PASSWORD)
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#kc-login')])
}

export async function navigateAndWaitForVessels(page: Page, navigate: () => Promise<unknown>): Promise<void> {
  await Promise.all([
    page.waitForResponse(response => new URL(response.url()).pathname === '/bff/v1/vessels/changes', {
      timeout: 120 * 1000
    }),
    navigate()
  ])
  await page.waitForSelector('[data-cy="first-loader"]', { hidden: true, timeout: 120 * 1000 })
}

export function recordRequests(page: Page): { count: (path: string) => number; paths: () => string[] } {
  const requests: HTTPRequest[] = []
  page.on('request', request => {
    requests.push(request)
  })

  const paths = () => requests.map(request => new URL(request.url()).pathname)

  return {
    count: (path: string) => paths().filter(requestPath => requestPath === path).length,
    paths
  }
}

export async function recordLongAnimationFrames(page: Page): Promise<void> {
  await page.evaluateOnNewDocument(() => {
    const frames: Array<{ blockingDuration: number; duration: number; startTime: number }> = []
    ;(window as any).__longAnimationFrames = frames
    new PerformanceObserver(list => {
      list.getEntries().forEach((entry: any) => {
        frames.push({ blockingDuration: entry.blockingDuration, duration: entry.duration, startTime: entry.startTime })
      })
    }).observe({ buffered: true, type: 'long-animation-frame' })
  })
}

export async function getLongAnimationFramesDurationSince(page: Page, sinceMs: number): Promise<number> {
  return page.evaluate(
    since =>
      ((window as any).__longAnimationFrames as Array<{ duration: number; startTime: number }>)
        .filter(frame => frame.startTime >= since)
        .reduce((total, frame) => total + frame.duration, 0),
    sinceMs
  )
}

export async function getResponseEndTime(page: Page, path: string): Promise<number | undefined> {
  return page.evaluate(
    resourcePath =>
      performance
        .getEntriesByType('resource')
        .filter(entry => new URL(entry.name).pathname === resourcePath)
        .map(entry => (entry as PerformanceResourceTiming).responseEnd)
        .at(-1),
    path
  )
}

export function delayRequests(page: Page, pathToDelay: string, delayMs: number): Promise<void> {
  page.on('request', request => {
    if (request.isInterceptResolutionHandled()) {
      return
    }
    if (new URL(request.url()).pathname === pathToDelay) {
      setTimeout(() => request.continue(), delayMs)

      return
    }

    request.continue()
  })

  return page.setRequestInterception(true)
}

export async function wait(durationMs: number): Promise<void> {
  await new Promise(resolve => {
    setTimeout(resolve, durationMs)
  })
}

/**
 * Runs the long timers of the page (≥ 1 minute: the refreshes) 1000 times faster:
 * a 5 minutes refresh happens every 300 ms.
 */
export async function accelerateLongTimers(page: Page): Promise<void> {
  await page.evaluateOnNewDocument(() => {
    const ACCELERATION = 1000
    const accelerate = (delay?: number) => (delay && delay >= 60 * 1000 ? delay / ACCELERATION : delay)
    const { setInterval: nativeSetInterval, setTimeout: nativeSetTimeout } = window
    ;(window as any).setInterval = (handler: TimerHandler, delay?: number, ...args: any[]) =>
      nativeSetInterval(handler, accelerate(delay), ...args)
    ;(window as any).setTimeout = (handler: TimerHandler, delay?: number, ...args: any[]) =>
      nativeSetTimeout(handler, accelerate(delay), ...args)
  })
}
