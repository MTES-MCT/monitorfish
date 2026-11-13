import puppeteer, { type Browser, type HTTPRequest, type Page } from 'puppeteer'

export const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:3000'

// Seeded in `infra/dev/keycloak/realm-monitor-dev.json`
const USER = { password: process.env.PERF_PASSWORD ?? 'fish', username: process.env.PERF_USERNAME ?? 'user' }
export const SUPER_USER = {
  password: process.env.PERF_SUPER_USER_PASSWORD ?? 'fish',
  username: process.env.PERF_SUPER_USER_USERNAME ?? 'superuser'
}

export async function launchChrome(): Promise<Browser> {
  return puppeteer.launch({
    args: ['--no-proxy-server', '--window-size=1400,900'],
    channel: 'chrome',
    defaultViewport: { height: 900, width: 1400 },
    headless: process.env.IS_HEADLESS !== 'false'
  })
}

export async function login(page: Page, { password, username } = USER): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: 'load' })
  await page.locator('button ::-p-text(ProConnect)').click()
  await page.waitForSelector('#username')
  await page.type('#username', username)
  await page.type('#password', password)
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#kc-login')])
}

export async function navigateAndWaitForVessels(page: Page, navigate: () => Promise<unknown>): Promise<void> {
  await Promise.all([
    page.waitForResponse(response => new URL(response.url()).pathname === '/bff/v1/vessels', {
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

export async function getLongAnimationFramesDurationBetween(
  page: Page,
  sinceMs: number,
  untilMs: number
): Promise<number> {
  return page.evaluate(
    (since, until) =>
      ((window as any).__longAnimationFrames as Array<{ duration: number; startTime: number }>)
        .filter(frame => frame.startTime >= since && frame.startTime < until)
        .reduce((total, frame) => total + frame.duration, 0),
    sinceMs,
    untilMs
  )
}

export async function getRequestStartTime(page: Page, path: string): Promise<number | undefined> {
  return page.evaluate(
    resourcePath =>
      performance
        .getEntriesByType('resource')
        .filter(entry => new URL(entry.name).pathname === resourcePath)
        .map(entry => entry.startTime)
        .at(-1),
    path
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
