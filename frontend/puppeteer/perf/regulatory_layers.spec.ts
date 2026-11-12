import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, launchChrome, login, navigateAndWaitForVessels, recordRequests } from './utils'

import type { Browser, Page } from 'puppeteer'

// Focus the map on Corsica
const CORSICA_URL = `${BASE_URL}/#@997505.75,5180266.24,8.70`
const SHOW_TOPIC_BUTTON = '[title=\'Afficher la thématique "Corse - Chaluts"\']'
const HIDE_TOPIC_BUTTON = '[title=\'Cacher la thématique "Corse - Chaluts"\']'

const isRegulatoryZoneRequest = (url: string) => url.includes('/geoserver/wfs') && url.includes('AND%20zone')

const isDisplayed = (page: Page, selector: string) =>
  page
    .waitForSelector(selector, { timeout: 3000 })
    .then(() => true)
    .catch(() => false)

async function openMyRegulatoryZonesWithCorseChaluts(page: Page) {
  const topicButtons = `${SHOW_TOPIC_BUTTON}, ${HIDE_TOPIC_BUTTON}`
  await page.locator('[title="Arbre des couches"]').click()
  // The topic may already be in "Mes zones réglementaires" (opened or closed), as the user layers are saved
  if (await isDisplayed(page, topicButtons)) {
    return
  }
  await page.locator('::-p-text(Mes zones réglementaires)').click()
  if (await isDisplayed(page, topicButtons)) {
    return
  }

  await page.locator('[name="Rechercher une zone réglementaire"]').fill('Corse')
  await page.locator('[title=\'Sélectionner "Corse - Chaluts"\']').click()
  // The section may already be opened after the selection: clicking it would close it
  if (!(await isDisplayed(page, `${SHOW_TOPIC_BUTTON}, ${HIDE_TOPIC_BUTTON}`))) {
    await page.locator('::-p-text(Mes zones réglementaires)').click()
  }
}

describe('Regulatory layers (non-super-user)', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launchChrome()
    page = await browser.newPage()
    await login(page)
    await navigateAndWaitForVessels(page, () => page.goto(CORSICA_URL))
  })

  afterAll(async () => {
    await browser.close()
  })

  it('fetches all the zones of a regulatory layer in a single request', async () => {
    await openMyRegulatoryZonesWithCorseChaluts(page)
    // The shown layers are saved for the user: start from an app without the layer loaded
    if (await page.$(HIDE_TOPIC_BUTTON)) {
      await page.locator(HIDE_TOPIC_BUTTON).click()
      await new Promise(resolve => {
        setTimeout(resolve, 2000)
      })
      // Not a `goto()`: the same URL with a hash would not reload the page
      await navigateAndWaitForVessels(page, () => page.reload())
      await openMyRegulatoryZonesWithCorseChaluts(page)
    }

    const urls: string[] = []
    page.on('request', request => {
      if (isRegulatoryZoneRequest(request.url())) {
        urls.push(request.url())
      }
    })
    const requests = recordRequests(page)
    const zoneErrors: string[] = []
    page.on('console', message => {
      if (message.type() === 'error' && message.text().includes('zone réglementaire')) {
        zoneErrors.push(message.text())
      }
    })
    await Promise.all([
      page.waitForResponse(response => isRegulatoryZoneRequest(response.url())),
      page.locator(SHOW_TOPIC_BUTTON).click()
    ])
    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })

    expect(requests.paths().length).toBeGreaterThan(0)
    // The 4 zones of "Corse - Chaluts" in one request
    expect(urls).toHaveLength(1)
    expect(zoneErrors).toEqual([])
  })
})
