import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { accelerateLongTimers, BASE_URL, launchChrome, login, navigateAndWaitForVessels, wait } from './utils'

import type { Browser, HTTPResponse } from 'puppeteer'

describe('Vessels refresh (non-super-user)', () => {
  let browser: Browser

  beforeAll(async () => {
    browser = await launchChrome()
  })

  afterAll(async () => {
    await browser.close()
  })

  it('only downloads the active vessels changes since the previous refresh', async () => {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await login(page)
    await accelerateLongTimers(page)

    const responses: Array<{ after: string | null; path: string; size: number }> = []
    page.on('response', async (response: HTTPResponse) => {
      const url = new URL(response.url())
      if (!url.pathname.startsWith('/bff/v1/vessels')) {
        return
      }
      const size = (await response.buffer().catch(() => Buffer.from(''))).length
      responses.push({ after: url.searchParams.get('after'), path: url.pathname, size })
    })

    await navigateAndWaitForVessels(page, () => page.goto(BASE_URL, { waitUntil: 'load' }))
    await wait(3000)

    const activeVesselsResponses = responses.filter(({ path }) =>
      ['/bff/v1/vessels', '/bff/v1/vessels/changes'].includes(path)
    )
    expect(activeVesselsResponses.filter(({ path }) => path === '/bff/v1/vessels')).toHaveLength(0)

    const [first, ...refreshes] = activeVesselsResponses
    expect(first?.after).toBeNull()
    expect(refreshes.length).toBeGreaterThan(0)
    refreshes.forEach(refresh => {
      expect(refresh.after).not.toBeNull()
      // Local vessels do not move: only the state of the vessels is sent back
      expect(refresh.size).toBeLessThan((first?.size ?? 0) / 100)
    })
    await context.close()
  })
})
