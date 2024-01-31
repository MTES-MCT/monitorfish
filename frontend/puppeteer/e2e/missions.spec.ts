import { beforeEach, expect, it } from '@jest/globals'
import { platform } from 'os'

import { assertContains, getFirstTab, getInputContent, listenToConsole, wait } from './utils'
import { SeaFrontGroup } from '../../src/domain/entities/seaFront/constants'

const TIMEOUT = 120 * 1000

const IS_CI = Boolean(process.env.CI)
const IS_DARWIN = platform() === 'darwin'
const WEBAPP_PORT = IS_CI ? 8880 : 3000
const WEBAPP_HOST = IS_DARWIN ? '0.0.0.0' : 'localhost'

const URL = `http://${WEBAPP_HOST}:${WEBAPP_PORT}/side_window`

let pageA
let pageB

describe('Missions Form', () => {
  beforeEach(async () => {
    // @ts-ignore
    pageA = await getFirstTab(browsers[0])
    listenToConsole(pageA, 1)

    // @ts-ignore
    pageB = await getFirstTab(browsers[1])
    listenToConsole(pageB, 2)

    /* eslint-disable no-restricted-syntax */
    for (const page of [pageA, pageB]) {
      await page.goto(URL, { waitUntil: 'domcontentloaded' })
      await wait(2000)

      await page.waitForSelector('[title="Missions et contrôles"]')
      await page.click('[title="Missions et contrôles"]')

      await page.waitForSelector(`[data-cy="side-window-sub-menu-${SeaFrontGroup.NAMO}"]`)
      await page.click(`[data-cy="side-window-sub-menu-${SeaFrontGroup.NAMO}"]`)
      await wait(2000)

      await page.waitForSelector('.TableBodyRow[data-id="29"] > div > [title="Éditer la mission"]')
      await page.click('.TableBodyRow[data-id="29"] > div > [title="Éditer la mission"]')

      await wait(1000)
    }
  }, 50000)

  it(
    'Two windows must be synchronized on form update',
    async () => {
      /**
       * User A modify "Control unit contact"
       */
      await pageB.focus('[name="contact_0"]')
      await pageA.focus('[name="contact_0"]')
      await wait(2000)
      const controlUnitContact = await pageA.waitForSelector('[name="contact_0"]')
      // Modify contact on first page
      await controlUnitContact.click({ clickCount: 3, delay: 50 })
      await controlUnitContact.type('A new tel. number', { delay: 50 })
      // Wait for the update to be sent
      await wait(1000)
      // Should send the update to the second page
      expect(await getInputContent(pageB, '[name="contact_0"]')).toBe('A new tel. number')
      // Erase the value
      await controlUnitContact.click({ clickCount: 3, delay: 50 })
      await controlUnitContact.type('contact', { delay: 50 })
      await wait(1000)

      /**
       * User B modify "Observations CNSP"
       */
      await pageB.focus('[name="observationsCnsp"]')
      await pageA.focus('[name="observationsCnsp"]')
      const observationsCnsp = await pageB.waitForSelector('[name="observationsCnsp"]')
      // Modify contact on first page
      await observationsCnsp.click({ clickCount: 3, delay: 50 })
      await observationsCnsp.type("A new observation, as I'm not sure of the purpose of this mission.", { delay: 25 })
      // Wait for the update to be sent
      await wait(1000)
      // Should send the update to the second page
      expect(await getInputContent(pageA, '[name="observationsCnsp"]')).toBe(
        "A new observation, as I'm not sure of the purpose of this mission."
      )
      // Erase the value
      await observationsCnsp.click({ clickCount: 3, delay: 50 })
      await observationsCnsp.type('Aucune', { delay: 50 })
      await wait(1000)

      /**
       * User A modify "Observations CACEM"
       */
      await pageA.focus('[name="observationsCacem"]')
      await pageB.focus('[name="observationsCacem"]')
      const observationsCacem = await pageA.waitForSelector('[name="observationsCacem"]')
      // Modify contact on first page
      await observationsCacem.click({ clickCount: 3 })
      await observationsCacem.type('A new observation for this mission.', { delay: 25 })
      // Wait for the update to be sent
      await wait(1000)
      // Should send the update to the second page
      expect(await getInputContent(pageB, '[name="observationsCacem"]')).toBe('A new observation for this mission.')
      // Erase the value
      await observationsCacem.click({ clickCount: 3 })
      await observationsCacem.type('Aucune', { delay: 50 })
      await wait(1000)

      /**
       * User B modify "Open By"
       */
      await pageA.focus('[name="openBy"]')
      await pageB.focus('[name="openBy"]')
      const openBy = await pageB.waitForSelector('[name="openBy"]')
      // Modify contact on first page
      await openBy.click({ clickCount: 3 })
      await openBy.type('LTH', { delay: 50 })
      // Wait for the update to be sent
      await wait(1000)
      // Should send the update to the second page
      expect(await getInputContent(pageA, '[name="openBy"]')).toBe('LTH')
      // Erase the value
      await openBy.click({ clickCount: 3 })
      await openBy.type('FDJ', { delay: 50 })
      await wait(2000)

      /**
       * User B close mission
       */
      const close = await pageB.waitForSelector('[data-cy="close-mission"]')
      await close.click()
      await wait(2000)
      await pageA.waitForSelector('.Element-Tag')
      await assertContains(pageA, '.Element-Tag', 'Clôturée')
      await wait(2000)

      /**
       * User A reopen mission
       */
      const reopen = await pageA.waitForSelector('[data-cy="reopen-mission"]')
      await reopen.click()
      await wait(2000)
      await pageB.waitForSelector('.TableBodyRow[data-id="29"] > div > [title="Éditer la mission"]')
      await pageB.click('.TableBodyRow[data-id="29"] > div > [title="Éditer la mission"]')
      await wait(250)
      await pageB.waitForSelector('.Element-Tag')
      await assertContains(pageB, '.Element-Tag', 'En cours')
      await wait(2000)

      /**
       * User B re-close mission
       */
      await wait(1000)
      const secondClose = await pageB.waitForSelector('[data-cy="close-mission"]')
      await secondClose.click()
      await wait(2000)
      await pageA.waitForSelector('.Element-Tag')
      await assertContains(pageA, '.Element-Tag', 'Clôturée')
      await wait(2000)

      /**
       * User A reopen mission
       */
      const finalReopen = await pageA.waitForSelector('[data-cy="reopen-mission"]')
      await finalReopen.click()
      await wait(5000)
    },
    TIMEOUT
  )
})
