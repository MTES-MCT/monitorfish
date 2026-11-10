import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, delayRequests, launchChrome, login, navigateAndWaitForVessels, recordRequests } from './utils'

import type { Browser, Page } from 'puppeteer'

describe('Startup of the main window (non-super-user)', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launchChrome()
    page = await browser.newPage()
    await login(page)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('fetches each referential only once', async () => {
    const requests = recordRequests(page)
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(String(error)))

    await navigateAndWaitForVessels(page, () => page.reload())

    expect(pageErrors).toEqual([])

    expect(requests.count('/bff/v1/gears')).toBe(1)
    expect(requests.count('/api/v1/infractions')).toBe(1)
    expect(requests.count('/bff/v1/species')).toBe(1)
    expect(requests.count('/bff/v1/vessels')).toBe(1)
  })

  it('does not download the login background when the user account is slow to load', async () => {
    const slowPage = await browser.newPage()
    const requests = recordRequests(slowPage)
    // On a satellite link, the user account request takes seconds, while the login background is displayed
    await delayRequests(slowPage, '/bff/v1/authorization/current', 3000)

    await navigateAndWaitForVessels(slowPage, () => slowPage.goto(BASE_URL))

    expect(requests.paths().filter(path => path.includes('landing_background'))).toEqual([])

    await slowPage.close()
  })
})
