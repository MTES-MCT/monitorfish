import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, delayRequests, launchChrome, login, navigateAndWaitForVessels, recordRequests, wait } from './utils'

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

  it('does not download the icons of the layers only displayed to super-users', async () => {
    const requests = recordRequests(page)

    await navigateAndWaitForVessels(page, () => page.reload())
    await wait(3000)

    expect(requests.paths().filter(path => path.startsWith('/map-icons/icon_mission'))).toHaveLength(0)
    expect(requests.paths().filter(path => path.startsWith('/map-icons/icon_reporting'))).toHaveLength(0)
  })

  it('downloads a small login background while the user account is loading', async () => {
    const slowPage = await browser.newPage()
    const backgroundSizes: number[] = []
    slowPage.on('response', async response => {
      if (response.url().includes('landing_background')) {
        backgroundSizes.push((await response.buffer()).length)
      }
    })
    // On a satellite link, the user account request takes seconds, while the login background is displayed
    await delayRequests(slowPage, '/bff/v1/authorization/current', 3000)

    await navigateAndWaitForVessels(slowPage, () => slowPage.goto(BASE_URL))

    expect(backgroundSizes.length).toBeGreaterThan(0)
    backgroundSizes.forEach(size => expect(size).toBeLessThan(100 * 1024))

    await slowPage.close()
  })
})
