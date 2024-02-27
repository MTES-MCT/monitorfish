import { beforeEach, describe, expect, it } from '@jest/globals'
import { platform } from 'os'
import { ElementHandle, Page } from 'puppeteer'

import { assertContains, getPage, getInputContent, getSideWindow, listenToConsole, wait } from './utils'

const TIMEOUT = 120 * 1000

const IS_CI = Boolean(process.env.CI)
const IS_DARWIN = platform() === 'darwin'
const WEBAPP_PORT = IS_CI ? 8880 : 3000
const WEBAPP_HOST = IS_DARWIN ? '0.0.0.0' : 'localhost'

const URL = `http://${WEBAPP_HOST}:${WEBAPP_PORT}/`

let mainWindow: Page

describe('Side window', () => {
  beforeEach(async () => {
    mainWindow = await getPage(browsers[0])
    listenToConsole(mainWindow, 1)

    await mainWindow.goto(URL, { waitUntil: 'domcontentloaded' })
    await wait(2000)
  }, 50000)

  it(
    'A control must replace another control previously opened in the side window',
    async () => {
      /**
       * Open vessel sidebar Controls tab
       */
      await wait(2000)
      const searchVessel = await mainWindow.waitForSelector('input[placeholder="Rechercher un navire..."]')
      searchVessel.click()
      mainWindow.type('input[placeholder="Rechercher un navire..."]', 'pheno', { delay: 50 })

      const foundVessel = await mainWindow.waitForSelector('mark')
      foundVessel.click()

      await wait(2000)
      const controlsTab = await mainWindow.waitForSelector('*[data-cy="vessel-menu-controls"]')
      controlsTab.click()

      await wait(1000)
      await mainWindow.waitForSelector('*[data-cy="vessel-controls-year"]')
      const years = await mainWindow.$$('*[data-cy="vessel-controls-year"]')
      console.log(`Found ${years.length} year`)
      years.forEach(async year => {
        year.click()
        await wait(500)
      })

      /**
       * Open first control in side window
       */
      await mainWindow.waitForXPath("//span[contains(text(), 'Ouvrir le contrôle')]/..")
      const openControlButtons = (await mainWindow.$x(
        "//span[contains(text(), 'Ouvrir le contrôle')]/.."
      )) as ElementHandle<HTMLButtonElement>[]
      console.log(`Found ${openControlButtons.length} controls`)

      const firstControlButton = openControlButtons[0]
      if (!firstControlButton) {
        throw new Error('The first control button is undefined')
      }
      await firstControlButton.focus()
      await firstControlButton.click()

      await wait(2000)
      const sideWindow = await getSideWindow()
      if (!sideWindow) {
        throw new Error('sideWindow page is undefined')
      }

      await assertContains(sideWindow, '.Element-Tag', 'Clôturée')
      await assertContains(sideWindow, '.Element-Tag', 'Appréhension espèce')
      await wait(1000)

      /**
       * Open another control in side window
       */
      await mainWindow.focus('body')
      await mainWindow.waitForXPath("//span[contains(text(), 'Ouvrir le contrôle')]/..")
      const openSecondControlButtons = (await mainWindow.$x(
        "//span[contains(text(), 'Ouvrir le contrôle')]/.."
      )) as ElementHandle<HTMLButtonElement>[]
      const secondControlButton = openSecondControlButtons[1]
      if (!secondControlButton) {
        throw new Error('The second control button is undefined')
      }
      await secondControlButton.focus()
      await secondControlButton.click()

      /**
       * Modify contact on second control
       */
      const controlUnitContact = await sideWindow.waitForSelector('[name="contact_0"]')
      await controlUnitContact.click({ clickCount: 3, delay: 50 })
      await controlUnitContact.type('A new tel. number', { delay: 50 })
      await wait(1000)

      /**
       * Open first control again
       */
      await firstControlButton.focus()
      await firstControlButton.click()

      /**
       * The control and mission form should be unmodified
       */
      await assertContains(sideWindow, '.Element-Tag', 'Appréhension espèce')
      expect(await getInputContent(sideWindow, '[name="contact_0"]')).toBe('')

      await wait(5000)
      await sideWindow.close()
      await mainWindow.close()
    },
    TIMEOUT
  )
})
