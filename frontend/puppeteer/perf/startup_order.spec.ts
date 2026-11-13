import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, delayRequests, launchChrome, login, navigateAndWaitForVessels, wait } from './utils'

import type { Browser, HTTPRequest, Page } from 'puppeteer'

const isRegulatoryCatalogRequest = (request: HTTPRequest) => request.url().includes('propertyName=id,law_type')

/**
 * Records when each request is sent and when its response is received, in milliseconds since the start.
 */
function recordRequestTimes(page: Page) {
  const startedAt = Date.now()
  const times: Array<{ finishedAt?: number; request: HTTPRequest; sentAt: number }> = []
  page.on('request', request => {
    times.push({ request, sentAt: Date.now() - startedAt })
  })
  page.on('requestfinished', request => {
    const time = times.find(({ request: sentRequest }) => sentRequest === request)
    if (time) {
      time.finishedAt = Date.now() - startedAt
    }
  })

  const find = (isMatching: (request: HTTPRequest) => boolean) => times.find(({ request }) => isMatching(request))
  const findByPath = (path: string) => find(request => new URL(request.url()).pathname === path)

  return { find, findByPath }
}

describe('Startup order of the main window (non-super-user)', () => {
  let browser: Browser

  beforeAll(async () => {
    browser = await launchChrome()
    const page = await browser.newPage()
    await login(page)
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  it('downloads the referentials after the vessels, not to share the bandwidth of a satellite link with them', async () => {
    const page = await browser.newPage()
    // As the download of the vessels on a satellite link
    await delayRequests(page, '/bff/v1/vessels', 2000)
    const times = recordRequestTimes(page)

    await navigateAndWaitForVessels(page, () => page.goto(BASE_URL))
    await wait(2000)

    const vesselsReceivedAt = times.findByPath('/bff/v1/vessels')!.finishedAt!
    expect(times.findByPath('/bff/v1/species')!.sentAt).toBeGreaterThanOrEqual(vesselsReceivedAt)
    expect(times.findByPath('/api/v1/infractions')!.sentAt).toBeGreaterThanOrEqual(vesselsReceivedAt)
    expect(times.find(isRegulatoryCatalogRequest)!.sentAt).toBeGreaterThanOrEqual(vesselsReceivedAt)

    await page.close()
  })

  it('downloads the regulatory catalog in parallel of the species', async () => {
    const page = await browser.newPage()
    await delayRequests(page, '/bff/v1/species', 2000)
    const times = recordRequestTimes(page)

    await navigateAndWaitForVessels(page, () => page.goto(BASE_URL))
    await wait(4000)

    expect(times.find(isRegulatoryCatalogRequest)!.sentAt).toBeLessThan(
      times.findByPath('/bff/v1/species')!.finishedAt!
    )

    await page.close()
  })
})
