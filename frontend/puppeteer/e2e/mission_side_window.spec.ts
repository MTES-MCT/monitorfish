import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { platform } from 'os'
import { Page } from 'puppeteer'

import { consoleListener, getInputContent, getTextContent, openNewPage, wait, waitForNewPage } from './utils'

const TIMEOUT = 160 * 1000

const IS_CI = Boolean(process.env.CI)
const IS_DARWIN = platform() === 'darwin'
const WEBAPP_PORT = IS_CI ? 8880 : 3000
const WEBAPP_HOST = IS_DARWIN ? '0.0.0.0' : 'localhost'

const URL = `http://${WEBAPP_HOST}:${WEBAPP_PORT}/`

const CONTACT_SELECTOR = '[name="mission_control_unit_contact_0"]'
const DIALOG_SELECTOR = '.Component-Dialog'
const MISSION_TITLE_SELECTOR = '[data-cy="mission-form-header"] h1'
const OPEN_CONTROL_SELECTOR = '[data-cy="open-control"]'

const FIRST_CONTROL_INDEX = 0
const SECOND_CONTROL_INDEX = 1

let mainWindow: Page
let sideWindow: Page | undefined

describe('Mission side window', () => {
  beforeEach(async () => {
    mainWindow = await openNewPage(browsers[0])
    consoleListener.start(mainWindow, 1)

    console.log(`[beforeEach] Navigating to ${URL}`)
    await mainWindow.goto(URL, { waitUntil: 'domcontentloaded' })
    await wait(2000)
  }, 50000)

  afterEach(async () => {
    consoleListener.stop()

    // Both pages are real browser windows: leaving them open would leak into the next spec file
    await sideWindow?.close()
    sideWindow = undefined
    await mainWindow.close()
  }, 30000)

  it(
    'Should replace the control previously opened in the side window',
    async () => {
      const controlCount = await openVesselControlsTab('pheno')
      expect(controlCount).toBeGreaterThanOrEqual(2)

      /**
       * Open the first control in the side window
       */
      console.log('[test] Step 1: Opening the first control')
      const sideWindowPromise = waitForNewPage(browsers[0])
      await openControl(FIRST_CONTROL_INDEX)
      sideWindow = await sideWindowPromise
      consoleListener.start(sideWindow, 2)

      await sideWindow.waitForSelector(MISSION_TITLE_SELECTOR)
      const firstMissionTitle = await getTextContent(sideWindow, MISSION_TITLE_SELECTOR)
      const firstMissionContact = await getInputContent(sideWindow, CONTACT_SELECTOR)
      console.log(`[test] First control opened on "${firstMissionTitle}" (contact: "${firstMissionContact}")`)

      /**
       * Open the second control: it must replace the first one within the same side window
       */
      console.log('[test] Step 2: Opening the second control')
      await openControl(SECOND_CONTROL_INDEX)
      const secondMissionTitle = await waitForOtherMissionToBeOpened(sideWindow, firstMissionTitle)
      console.log(`[test] Second control opened on "${secondMissionTitle}"`)

      /**
       * Re-open the first control: its mission must be restored as it was
       */
      console.log('[test] Step 3: Re-opening the first control')
      await openControl(FIRST_CONTROL_INDEX)
      await waitForOtherMissionToBeOpened(sideWindow, secondMissionTitle)

      expect(await getTextContent(sideWindow, MISSION_TITLE_SELECTOR)).toBe(firstMissionTitle)
      expect(await getInputContent(sideWindow, CONTACT_SELECTOR)).toBe(firstMissionContact)
      console.log('[test] Test complete')
    },
    TIMEOUT
  )
})

/**
 * Open the "Contrôles" tab of the vessel sidebar and expand every year,
 * then return the number of controls listed.
 */
async function openVesselControlsTab(vesselSearchTerm: string): Promise<number> {
  console.log(`[setup] Searching vessel "${vesselSearchTerm}"`)
  await mainWindow.waitForSelector('[data-cy="VesselSearch-input"]')
  await mainWindow.type('[data-cy="VesselSearch-input"]', vesselSearchTerm, { delay: 50 })

  await mainWindow.waitForSelector('[data-cy="VesselSearch-item"]')
  await mainWindow.click('[data-cy="VesselSearch-item"]')
  await mainWindow.waitForSelector('[data-cy="vessel-sidebar"]')

  console.log('[setup] Opening the "Contrôles" tab')
  await mainWindow.waitForSelector('[data-cy="vessel-menu-controls"]')
  await mainWindow.click('[data-cy="vessel-menu-controls"]')

  await mainWindow.waitForSelector('[data-cy="vessel-controls-year"]')
  const years = await mainWindow.$$('[data-cy="vessel-controls-year"]')
  console.log(`[setup] Expanding ${years.length} year(s) of controls`)
  for (const year of years) {
    await year.click()
    await wait(200)
  }

  await mainWindow.waitForSelector(OPEN_CONTROL_SELECTOR)

  return (await mainWindow.$$(OPEN_CONTROL_SELECTOR)).length
}

/**
 * The vessel sidebar re-renders on its own polling, which detaches the previously queried nodes,
 * so the buttons are looked up again on every click.
 */
async function openControl(index: number) {
  await mainWindow.bringToFront()

  const openControlButtons = await mainWindow.$$(OPEN_CONTROL_SELECTOR)
  const openControlButton = openControlButtons[index]
  if (!openControlButton) {
    throw new Error(`[test] No control to open at index ${index}.`)
  }

  await openControlButton.click()
}

/**
 * Wait for the side window to display another mission than the one titled `previousTitle`,
 * let its form finish its initialization, and return the title of that other mission.
 *
 * Opening a control must never require the user to discard anything: an "unsaved changes" dialog
 * here means the mission form flagged itself as modified on its own.
 */
async function waitForOtherMissionToBeOpened(sideWindowPage: Page, previousTitle: string | null): Promise<string> {
  await sideWindowPage.waitForFunction(
    (selector: string, title: string | null) => document.querySelector(selector)?.textContent !== title,
    { timeout: 30 * 1000 },
    MISSION_TITLE_SELECTOR,
    previousTitle
  )

  await wait(1000)

  if (await sideWindowPage.$(DIALOG_SELECTOR)) {
    const dialogText = await getTextContent(sideWindowPage, DIALOG_SELECTOR)

    throw new Error(`[test] An unexpected dialog is blocking the side window: "${dialogText}".`)
  }

  return (await getTextContent(sideWindowPage, MISSION_TITLE_SELECTOR)) ?? ''
}
