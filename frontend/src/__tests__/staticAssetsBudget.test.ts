import { describe, expect, it } from '@jest/globals'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const FLAGS_DIRECTORY = join(__dirname, '../../public/flags')
// A flag is displayed at 16-24px wide: a few KB is enough
const MAX_FLAG_SIZE_IN_BYTES = 5 * 1024

describe('Static assets budget', () => {
  it('Should keep every flag small, as they are downloaded when opening a vessel', () => {
    const oversizedFlags = readdirSync(FLAGS_DIRECTORY)
      .map(fileName => ({ fileName, size: statSync(join(FLAGS_DIRECTORY, fileName)).size }))
      .filter(({ size }) => size > MAX_FLAG_SIZE_IN_BYTES)
      .map(({ fileName, size }) => `${fileName} (${Math.round(size / 1024)} KB)`)

    expect(oversizedFlags).toEqual([])
  })
})
