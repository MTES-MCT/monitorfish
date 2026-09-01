import { describe, expect, it } from '@jest/globals'

import { getFlagStateFromMmsi } from '../utils'

describe('utils/getFlagStateFromMmsi()', () => {
  it('should return the country code of the MID', () => {
    expect(getFlagStateFromMmsi(227123456)).toEqual('fr')
    expect(getFlagStateFromMmsi(224987654)).toEqual('es')
    expect(getFlagStateFromMmsi(232000001)).toEqual('gb')
  })

  it('should return undefined when the MID is unknown', () => {
    expect(getFlagStateFromMmsi(111123456)).toBeUndefined()
    expect(getFlagStateFromMmsi(999999999)).toBeUndefined()
  })

  it('should return undefined when the MMSI is undefined', () => {
    expect(getFlagStateFromMmsi(undefined)).toBeUndefined()
  })
})
