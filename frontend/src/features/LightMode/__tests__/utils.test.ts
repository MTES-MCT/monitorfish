import { afterEach, describe, expect, it } from '@jest/globals'

import { LightModePreference } from '../constants'
import { getLightModePreference, getLightModeRedirection, isConnectionSlow, setLightModePreference } from '../utils'

describe('LightMode/utils', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  describe('isConnectionSlow()', () => {
    it.each([
      { connection: { effectiveType: '3g' }, expected: true },
      { connection: { effectiveType: '2g' }, expected: true },
      { connection: { effectiveType: '4g', rtt: 900 }, expected: true },
      { connection: { downlink: 0.3, effectiveType: '4g' }, expected: true },
      { connection: { downlink: 10, effectiveType: '4g', rtt: 50 }, expected: false },
      { connection: undefined, expected: false }
    ])('Should return $expected for a $connection connection', ({ connection, expected }) => {
      expect(isConnectionSlow({ connection, vesselsFetchDurationMs: 2000 })).toBe(expected)
    })

    it('Should consider the connection slow when the vessels take a long time to be downloaded', () => {
      expect(isConnectionSlow({ connection: undefined, vesselsFetchDurationMs: 20_000 })).toBe(true)
      expect(isConnectionSlow({ connection: undefined, vesselsFetchDurationMs: 3000 })).toBe(false)
    })
  })

  describe('getLightModePreference() & setLightModePreference()', () => {
    it('Should store the preference of the user', () => {
      expect(getLightModePreference()).toBeUndefined()

      setLightModePreference(LightModePreference.DECLINED)

      expect(getLightModePreference()).toBe(LightModePreference.DECLINED)
    })

    it('Should not throw when the storage is not available', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError')
      })
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('SecurityError')
      })

      expect(() => setLightModePreference(LightModePreference.ENABLED)).not.toThrow()
      expect(getLightModePreference()).toBeUndefined()
    })
  })

  describe('getLightModeRedirection()', () => {
    it('Should redirect the main window to the light mode when the user enabled it, keeping the map position', () => {
      setLightModePreference(LightModePreference.ENABLED)

      expect(getLightModeRedirection('/', '#@332899.82,5914045.97,6.00')).toBe('/light#@332899.82,5914045.97,6.00')
    })

    it('Should not redirect the other pages, or when the light mode is not enabled', () => {
      setLightModePreference(LightModePreference.ENABLED)
      expect(getLightModeRedirection('/side_window', '')).toBeUndefined()
      expect(getLightModeRedirection('/light', '')).toBeUndefined()

      setLightModePreference(LightModePreference.DECLINED)
      expect(getLightModeRedirection('/', '')).toBeUndefined()
    })
  })
})
