import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, delayRequests, launchChrome, login, navigateAndWaitForVessels } from './utils'

import type { Browser, Page } from 'puppeteer'

const VESSEL_FIND_DELAY_MS = 2000

describe('Vessel sidebar (non-super-user)', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launchChrome()
    page = await browser.newPage()
    await login(page)
    // On production, `/vessels/find` takes 1 to 1.6 s to respond
    await delayRequests(page, '/bff/v1/vessels/find', VESSEL_FIND_DELAY_MS)
    await navigateAndWaitForVessels(page, () => page.goto(BASE_URL))
  })

  afterAll(async () => {
    await browser.close()
  })

  it('fetches the vessel logbook without waiting for the vessel to be found', async () => {
    const requestStartTimes: Record<string, number> = {}
    page.on('request', request => {
      const path = new URL(request.url()).pathname
      requestStartTimes[path] ??= Date.now()
    })

    await page.locator('input[placeholder="Rechercher un navire..."]').fill('PHENOMENE')
    await page.locator('[data-cy="VesselSearch-item"]').click()
    await page.waitForResponse(response => new URL(response.url()).pathname === '/bff/v1/vessels/logbook/find')

    const vesselFindStart = requestStartTimes['/bff/v1/vessels/find']
    const logbookFindStart = requestStartTimes['/bff/v1/vessels/logbook/find']
    expect(vesselFindStart).toBeDefined()
    expect(logbookFindStart).toBeDefined()
    // Sequential requests would add a round trip (seconds on a satellite connection)
    expect(Math.abs(logbookFindStart! - vesselFindStart!)).toBeLessThan(VESSEL_FIND_DELAY_MS / 2)
  })
})
