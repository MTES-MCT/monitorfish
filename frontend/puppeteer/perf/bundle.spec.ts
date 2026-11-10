import { describe, expect, it } from '@jest/globals'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { gzipSync } from 'zlib'

const BUILD_ASSETS_DIRECTORY = join(__dirname, '../../build/assets')

function getGzippedSizeInKb(fileNamePrefix: string): number {
  const fileName = readdirSync(BUILD_ASSETS_DIRECTORY).find(
    name => name.startsWith(`${fileNamePrefix}-`) && name.endsWith('.js')
  )
  if (!fileName) {
    throw new Error(`No ${fileNamePrefix} bundle found in ${BUILD_ASSETS_DIRECTORY}, run the build first.`)
  }

  return Math.round(gzipSync(readFileSync(join(BUILD_ASSETS_DIRECTORY, fileName))).length / 1024)
}

describe('Production bundle budget', () => {
  it('keeps the web worker small, as it is downloaded in addition to the main bundle', () => {
    expect(getGzippedSizeInKb('MonitorFishWebWorker')).toBeLessThan(150)
  })
})
