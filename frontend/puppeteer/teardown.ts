import os from 'os'
import path from 'path'
import rimraf from 'rimraf'

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

export default async () => {
  // Close all browsers
  for (const browser of global.__BROWSERS__) {
    await browser.close()
  }

  // clean-up the temporary file used to write the browsers wsEndpoints
  if (!process.env.CI) {
    rimraf.sync(DIR)
  }
}
