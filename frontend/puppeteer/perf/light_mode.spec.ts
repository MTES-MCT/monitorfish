import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, launchChrome, login, navigateAndWaitForVessels } from './utils'

import type { Browser, Page } from 'puppeteer'

// Latency of a geostationary satellite link (as the VSAT-Ku of the patrol vessels)
const SATELLITE_NETWORK_CONDITIONS = { download: (1.5 * 1024 * 1024) / 8, latency: 800, upload: (256 * 1024) / 8 }

describe('Light mode (non-super-user)', () => {
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

  it('is suggested on a slow connection, and remembered once enabled', async () => {
    await page.emulateNetworkConditions(SATELLITE_NETWORK_CONDITIONS)
    await navigateAndWaitForVessels(page, () => page.goto(`${BASE_URL}/#@-224002.65,6302673.54,8.70`))

    await page.waitForSelector('[data-cy="light-mode-suggestion"]', { timeout: 30 * 1000 })
    const mapPositionHash = new URL(page.url()).hash
    await Promise.all([
      page.waitForNavigation(),
      page.locator('[data-cy="light-mode-suggestion"] ::-p-text(Activer)').click()
    ])
    expect(new URL(page.url()).pathname).toBe('/light')
    expect(new URL(page.url()).hash).toBe(mapPositionHash)

    await page.emulateNetworkConditions(null)
    await page.goto(BASE_URL, { waitUntil: 'load' })
    await page.waitForFunction(() => window.location.pathname === '/light')
  })

  it('can be disabled from the account menu', async () => {
    await page.locator('[title="Mon compte"]').click()
    await Promise.all([page.waitForNavigation(), page.locator('::-p-text(Désactiver le mode connexion lente)').click()])

    expect(new URL(page.url()).pathname).toBe('/')
    await page.goto(BASE_URL, { waitUntil: 'load' })
    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })
    expect(new URL(page.url()).pathname).toBe('/')
  })
})
