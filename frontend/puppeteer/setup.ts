import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import puppeteer from 'puppeteer'

const TEMP_DIRECTORY = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')
const NUMBER_OF_BROWSERS = 2
const WIDTH = 1020
const HEIGHT = 880

console.log(`Running in ${process.env.CI ? 'headless' : 'browser'} mode.`)

//
export default async () => {
  const browsers = []

  // Launch browsers side to side
  /* eslint-disable no-plusplus */
  for (let i = 0; i < NUMBER_OF_BROWSERS; i++) {
    const browser = await puppeteer.launch({
      // Chrome additional arguments to set browser size and position
      args: [
        `--window-size=${WIDTH},${HEIGHT}`,
        `--window-position=${WIDTH * i},0`,
        '--enable-features=ExperimentalJavaScript'
      ],
      defaultViewport: null,
      headless: process.env.CI ? 'new' : false,
      product: 'firefox'
    })

    const version = await browser.version()
    console.log('\nBrowser version: ', version)

    // @ts-ignore
    browsers.push(browser)
  }

  // use the file system to expose the browsers wsEndpoint for TestEnvironments
  await fs.mkdir(TEMP_DIRECTORY, { recursive: true })

  await fs.writeFile(
    path.join(TEMP_DIRECTORY, 'wsEndpoints'),
    // @ts-ignore
    browsers.map(browser => browser.wsEndpoint()).join('\\n')
  )

  // store all browser instances so we can teardown them later
  // this global is only available in the teardown but not in TestEnvironments
  global.__BROWSERS__ = browsers
}
