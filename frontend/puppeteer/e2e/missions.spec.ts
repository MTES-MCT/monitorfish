import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { platform } from 'os'
import { Page } from 'puppeteer'

import { consoleListener, getFirstTab, getInputContent, wait, waitForSelectorWithText } from './utils'
// /!\ Do not shorten imports, it will fail the run
import { SeafrontGroup } from '../../src/constants/seafront'

const TIMEOUT = 160 * 1000

const IS_CI = Boolean(process.env.CI)
const IS_DARWIN = platform() === 'darwin'
const WEBAPP_PORT = IS_CI ? 8880 : 3000
const WEBAPP_HOST = IS_DARWIN ? '0.0.0.0' : 'localhost'

const URL = `http://${WEBAPP_HOST}:${WEBAPP_PORT}/side_window`

let pageA: Page
let pageB: Page

describe('Missions Form', () => {
  beforeEach(async () => {
    console.log('[beforeEach] Getting first tab for browser 0')
    pageA = await getFirstTab(browsers[0])
    consoleListener.start(pageA, 1)

    console.log('[beforeEach] Getting first tab for browser 1')
    pageB = await getFirstTab(browsers[1])
    consoleListener.start(pageB, 2)

    /* eslint-disable no-restricted-syntax */
    for (const [index, page] of [pageA, pageB].entries()) {
      const label = index === 0 ? 'A' : 'B'

      console.log(`[beforeEach][page${label}] Navigating to ${URL}`)
      await page.goto(URL, { waitUntil: 'domcontentloaded' })
      await wait(2000)

      console.log(`[beforeEach][page${label}] Clicking "Missions et contrôles"`)
      await page.waitForSelector('[title="Missions et contrôles"]')
      await page.click('[title="Missions et contrôles"]')

      console.log(`[beforeEach][page${label}] Clicking sub-menu NAMO`)
      await page.waitForSelector(`[data-cy="side-window-sub-menu-${SeafrontGroup.NAMO}"]`)
      await page.click(`[data-cy="side-window-sub-menu-${SeafrontGroup.NAMO}"]`)
      await waitForSelectorWithText(page, 'h1', 'Missions en NAMO')

      console.log(`[beforeEach][page${label}] Removing default "En cours" filter`)
      // Remove default mission filter "En cours"
      await page.waitForSelector('.Component-SingleTag')
      await page.click('.Component-SingleTag > button')

      console.log(`[beforeEach][page${label}] Opening mission 29`)
      await page.waitForSelector('.TableBodyRow[data-id="29"] > td > [title="Éditer la mission"]')
      await page.click('.TableBodyRow[data-id="29"] > td > [title="Éditer la mission"]')

      await wait(1000)
      console.log(`[beforeEach][page${label}] Setup complete`)
    }
  }, 50000)

  afterEach(async () => {
    console.log('[afterEach] Stopping console listener')
    consoleListener.stop()
  })

  it(
    'Two windows must be synchronized on form update',
    async () => {
      /**
       * User A modify "Control unit contact"
       */
      console.log('[test] Step 1: User A modify "Control unit contact"')
      console.log('[test] Focusing pageB on mission_control_unit_contact_0')
      await pageB.focus('[name="mission_control_unit_contact_0"]')
      console.log('[test] Focusing pageA on mission_control_unit_contact_0')
      await pageA.focus('[name="mission_control_unit_contact_0"]')
      await wait(2000)
      console.log('[test] Waiting for selector on pageA')
      const controlUnitContact = await pageA.waitForSelector('[name="mission_control_unit_contact_0"]')
      if (!controlUnitContact) {
        throw new Error('[test] Could not find mission_control_unit_contact_0 on pageA')
      }
      // Modify contact on first page
      console.log('[test] Clicking and typing "A new tel. number" on pageA')
      await controlUnitContact.click({ clickCount: 3, delay: 50 })
      await controlUnitContact.type('A new tel. number', { delay: 50 })
      // Wait for the update to be sent
      console.log('[test] Waiting 1s for update to propagate')
      await wait(1000)
      // Should send the update to the second page
      const contactValueB = await getInputContent(pageB, '[name="mission_control_unit_contact_0"]')
      console.log(`[test] pageB contact value: "${contactValueB}" (expected: "A new tel. number")`)
      expect(contactValueB).toBe('A new tel. number')
      // Erase the value
      console.log('[test] Erasing contact value back to "contact"')
      await controlUnitContact.click({ clickCount: 3, delay: 50 })
      await controlUnitContact.type('contact', { delay: 50 })
      await wait(1000)

      /**
       * User B modify "Observations CNSP"
       */
      console.log('[test] Step 2: User B modify "Observations CNSP"')
      console.log('[test] Focusing pageB on observationsCnsp')
      await pageB.focus('[name="observationsCnsp"]')
      console.log('[test] Focusing pageA on observationsCnsp')
      await pageA.focus('[name="observationsCnsp"]')
      console.log('[test] Waiting for selector on pageB')
      const observationsCnsp = await pageB.waitForSelector('[name="observationsCnsp"]')
      if (!observationsCnsp) {
        throw new Error('[test] Could not find observationsCnsp on pageB')
      }
      // Modify contact on first page
      console.log('[test] Clicking and typing observation on pageB')
      await observationsCnsp.click({ clickCount: 3, delay: 50 })
      await observationsCnsp.type("A new observation, as I'm not sure of the purpose of this mission.", { delay: 25 })
      // Wait for the update to be sent
      console.log('[test] Waiting 1s for update to propagate')
      await wait(1000)
      // Should send the update to the second page
      const cnspValueA = await getInputContent(pageA, '[name="observationsCnsp"]')
      console.log(`[test] pageA observationsCnsp value: "${cnspValueA}"`)
      expect(cnspValueA).toBe(
        "A new observation, as I'm not sure of the purpose of this mission."
      )
      // Erase the value
      console.log('[test] Erasing observationsCnsp back to "Aucune"')
      await observationsCnsp.click({ clickCount: 3, delay: 50 })
      await observationsCnsp.type('Aucune', { delay: 50 })
      await wait(1000)

      /**
       * User A modify "Observations CACEM"
       */
      console.log('[test] Step 3: User A modify "Observations CACEM"')
      console.log('[test] Focusing pageA on observationsCacem')
      await pageA.focus('[name="observationsCacem"]')
      console.log('[test] Focusing pageB on observationsCacem')
      await pageB.focus('[name="observationsCacem"]')
      console.log('[test] Waiting for selector on pageA')
      const observationsCacem = await pageA.waitForSelector('[name="observationsCacem"]')
      if (!observationsCacem) {
        throw new Error('[test] Could not find observationsCacem on pageA')
      }
      // Modify contact on first page
      console.log('[test] Clicking and typing observation on pageA')
      await observationsCacem.click({ clickCount: 3 })
      await observationsCacem.type('A new observation for this mission.', { delay: 25 })
      // Wait for the update to be sent
      console.log('[test] Waiting 1s for update to propagate')
      await wait(1000)
      // Should send the update to the second page
      const cacemValueB = await getInputContent(pageB, '[name="observationsCacem"]')
      console.log(`[test] pageB observationsCacem value: "${cacemValueB}"`)
      expect(cacemValueB).toBe('A new observation for this mission.')
      // Erase the value
      console.log('[test] Erasing observationsCacem back to "Aucune"')
      await observationsCacem.click({ clickCount: 3 })
      await observationsCacem.type('Aucune', { delay: 50 })
      await wait(1000)

      /**
       * User B modify "Open By"
       */
      console.log('[test] Step 4: User B modify "Open By"')
      console.log('[test] Focusing pageA on openBy')
      await pageA.focus('[name="openBy"]')
      console.log('[test] Focusing pageB on openBy')
      await pageB.focus('[name="openBy"]')
      console.log('[test] Waiting for selector on pageB')
      const openBy = await pageB.waitForSelector('[name="openBy"]')
      if (!openBy) {
        throw new Error('[test] Could not find openBy on pageB')
      }
      // Modify contact on first page
      console.log('[test] Clicking and typing "LTH" on pageB')
      await openBy.click({ clickCount: 3 })
      await openBy.type('LTH', { delay: 50 })
      // Wait for the update to be sent
      console.log('[test] Waiting 1s for update to propagate')
      await wait(1000)
      // Should send the update to the second page
      const openByValueA = await getInputContent(pageA, '[name="openBy"]')
      console.log(`[test] pageA openBy value: "${openByValueA}" (expected: "LTH")`)
      expect(openByValueA).toBe('LTH')
      // Erase the value
      console.log('[test] Erasing openBy back to "FDJ"')
      await openBy.click({ clickCount: 3 })
      await openBy.type('FDJ', { delay: 50 })
      await wait(2000)
      console.log('[test] Test complete')
    },
    TIMEOUT
  )
})
