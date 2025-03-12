import { expect } from '@jest/globals'

import { getHours, getRemainingMinutes } from '../utils'

describe('Logbook/components/vesselLogbook/LogbookMessages/CPSMessage/utils.ts', () => {
  it('getHours Should get the hours', async () => {
    const hours = getHours(1565)

    // Then
    expect(hours).toEqual(26)
  })

  it('getRemainingMinutes Should get the remaining minutes', async () => {
    const hours = getRemainingMinutes(1565)

    // Then
    expect(hours).toEqual(5)
  })

  it('getRemainingMinutes Should return undefined', async () => {
    const hours = getRemainingMinutes(undefined)

    // Then
    expect(hours).toBeUndefined()
  })

  it('getRemainingMinutes Should return 40 minutes', async () => {
    const hours = getRemainingMinutes(40)

    // Then
    expect(hours).toEqual(40)
  })
})
