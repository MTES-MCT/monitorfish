import { promises as fs } from 'fs'
import NodeEnvironment from 'jest-environment-node'
import os from 'os'
import path from 'path'
import puppeteer from 'puppeteer'

import { wait } from './e2e/utils'

const TEMP_DIRECTORY = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

export default class PuppeteerEnvironment extends NodeEnvironment {
  override async setup() {
    await super.setup()
    await wait(5000)

    const wsEndpoints = await fs.readFile(path.join(TEMP_DIRECTORY, 'wsEndpoints'), { encoding: 'utf-8' })

    if (!wsEndpoints) {
      console.error('ERROR: Endpoints file not found.')
      process.exit()
    }

    // @ts-ignore
    this.global.browsers = []

    for (const wsEndpoint of wsEndpoints.split('\\n')) {
      // Connect puppeteer to the browsers we created during the global setup
      // @ts-ignore
      this.global.browsers.push(
        await puppeteer.connect({
          browserWSEndpoint: wsEndpoint,
          defaultViewport: null
        })
      )
    }
  }
}
