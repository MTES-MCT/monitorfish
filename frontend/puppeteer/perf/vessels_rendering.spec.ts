import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import {
  delayRequests,
  getLongAnimationFramesDurationBetween,
  getRequestStartTime,
  getResponseEndTime,
  launchChrome,
  login,
  navigateAndWaitForVessels,
  recordLongAnimationFrames
} from './utils'

import type { Browser, Page } from 'puppeteer'

// Slow office computers
const CPU_SLOWDOWN_RATE = 6
// The other startup tasks are done when the vessels are received, as on a vessels update
const VESSELS_DELAY_MS = 10 * 1000
const RENDERING_WINDOW_MS = 10 * 1000

describe('Vessels rendering (non-super-user)', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launchChrome()
    page = await browser.newPage()
    await login(page)
    await recordLongAnimationFrames(page)
    await delayRequests(page, '/bff/v1/vessels', VESSELS_DELAY_MS)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('does not freeze the page while processing the active vessels', async () => {
    await page.emulateCPUThrottling(CPU_SLOWDOWN_RATE)

    await navigateAndWaitForVessels(page, () => page.reload())
    await new Promise(resolve => {
      setTimeout(resolve, RENDERING_WINDOW_MS)
    })

    const vesselsResponseEnd = await getResponseEndTime(page, '/bff/v1/vessels')
    // The referentials are downloaded, then processed, once the vessels are displayed
    const vesselsDisplayEnd = await getRequestStartTime(page, '/bff/v1/species')
    const blockedDuration = await getLongAnimationFramesDurationBetween(page, vesselsResponseEnd!, vesselsDisplayEnd!)
    await page.emulateCPUThrottling(null)

    console.info(`Long animation frames after receiving vessels: ${Math.round(blockedDuration)} ms`)
    expect(blockedDuration).toBeLessThan(1800)
  })
})
