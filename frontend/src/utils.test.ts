import { expect } from '@jest/globals'

import { getDateTime, timeagoFrenchLocale } from './utils'

describe('utils', () => {
  it('getDateTime Should respect the timezone given fur UTC', async () => {
    // Given
    const date = '2021-03-24T22:07:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('24/03/2021 à 22h07')
  })

  it('getDateTime Should respect the timezone given', async () => {
    // Given
    const date = '2021-03-25T00:07:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('25/03/2021 à 00h07')
  })

  it('getDateTime Should respect another timezone given', async () => {
    // Given
    const date = '2021-04-06T23:24:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('06/04/2021 à 23h24')
  })

  it('timeagoFrenchLocale Should return the locale', async () => {
    // Given
    const tenDaysAgo = 10 * 24 * 60 * 60

    // When
    const formattedDate = timeagoFrenchLocale(undefined, 8, tenDaysAgo)

    // Then
    expect(formattedDate).toEqual(['il y a 10 jours', '10 jours'])
  })
})
