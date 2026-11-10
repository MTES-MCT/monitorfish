import { describe, expect, it } from '@jest/globals'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const PUBLIC_DIRECTORY = join(__dirname, '../../public')
const FLAGS_DIRECTORY = join(PUBLIC_DIRECTORY, 'flags')
// Displayed while the user account is loading, at each launch of the app
const MAX_LOGIN_BACKGROUND_SIZE_IN_BYTES = 100 * 1024
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

  it('Should keep the login background small, as it is displayed at each launch of the app', () => {
    const loginBackgroundUrls = ['auth/components/LoginBackground.tsx', 'auth/components/Login.tsx'].flatMap(path =>
      [...readFileSync(join(__dirname, '..', path), 'utf8').matchAll(/url\('([^']+)'\)/g)].map(([, url]) => url!)
    )

    expect(loginBackgroundUrls.length).toBeGreaterThan(0)
    loginBackgroundUrls.forEach(url => {
      expect(statSync(join(PUBLIC_DIRECTORY, url)).size).toBeLessThan(MAX_LOGIN_BACKGROUND_SIZE_IN_BYTES)
    })
  })
})
