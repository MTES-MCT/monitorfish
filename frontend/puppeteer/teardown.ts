import os from 'os'
import path from 'path'
import rimraf from 'rimraf'

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

export default async () => {
  const IS_HEADLESS = process.env.IS_HEADLESS === 'true'

  // Keep browser windows open in non-headless mode for debugging
  if (IS_HEADLESS) {
    await Promise.all(global.__BROWSERS__.map(browser => browser.close()))
  }

  // clean-up the temporary file used to write the browsers wsEndpoints
  if (!process.env.CI) {
    rimraf.sync(DIR)
  }
}
