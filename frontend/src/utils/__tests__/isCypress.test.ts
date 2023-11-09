import { beforeAll, describe, expect } from '@jest/globals'

import { isCypress } from '../isCypress'

describe('isCypress()', () => {
  const localStorageMock = (() => {
    let store = {}

    return {
      clear() {
        store = {}
      },
      getItem(key) {
        return store[key] || null
      },
      setItem(key, value) {
        store[key] = value.toString()
      }
    }
  })()

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  it('should return TRUE when `IS_CYPRESS` LocalStorage key is "true"', () => {
    localStorage.setItem('IS_CYPRESS', 'true')

    const result = isCypress()

    expect(result).toBe(true)
  })

  it('should return FALSE when `IS_CYPRESS` LocalStorage key is missing', () => {
    const result = isCypress()

    expect(result).toBe(false)
  })
})
