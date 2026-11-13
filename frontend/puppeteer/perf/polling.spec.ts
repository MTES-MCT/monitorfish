import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, launchChrome, login, navigateAndWaitForVessels, recordRequests, SUPER_USER, wait } from './utils'

import type { Browser, Page } from 'puppeteer'

const ALERTS_PATH = '/bff/v1/operational_alerts'
const BEACON_MALFUNCTIONS_PATH = '/bff/v1/beacon_malfunctions'
// The side window lists are polled every minute
const POLLING_WAIT_MS = 70 * 1000

describe('Polling of the side window (super-user)', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launchChrome()
    page = await browser.newPage()
    await login(page, SUPER_USER)
    await navigateAndWaitForVessels(page, () => page.goto(BASE_URL))
    await wait(3000)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('polls the beacon malfunctions shown, but not the alerts hidden behind them', async () => {
    const requests = recordRequests(page)

    await page.locator('[data-cy="beacon-malfunction-button"]').click()
    await wait(POLLING_WAIT_MS)

    expect(requests.count(BEACON_MALFUNCTIONS_PATH)).toBeGreaterThanOrEqual(1)
    expect(requests.count(ALERTS_PATH)).toBe(0)
  })

  it('polls the alerts shown', async () => {
    const requests = recordRequests(page)

    await page.locator('[data-cy="alerts-button"]').click()
    await wait(POLLING_WAIT_MS)

    expect(requests.count(ALERTS_PATH)).toBeGreaterThanOrEqual(1)
  })
})
