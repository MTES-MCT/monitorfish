import { describe, expect, it } from '@jest/globals'

import { isPuppeteer } from '../isPuppeteer'

const setWebdriver = (value: boolean | undefined) => {
  Object.defineProperty(navigator, 'webdriver', {
    configurable: true,
    value
  })
}

describe('isPuppeteer()', () => {
  afterEach(() => {
    setWebdriver(undefined)
  })

  it('should return TRUE when `navigator.webdriver` is TRUE', () => {
    setWebdriver(true)

    const result = isPuppeteer()

    expect(result).toBe(true)
  })

  it('should return FALSE when `navigator.webdriver` is undefined', () => {
    const result = isPuppeteer()

    expect(result).toBe(false)
  })
})
