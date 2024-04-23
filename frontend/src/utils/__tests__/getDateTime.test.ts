import { describe, expect, it } from '@jest/globals'

import { getDateTime } from '../getDateTime'

describe('utils/getDateTime()', () => {
  it('getDateTime Should respect the timezone given fur UTC', () => {
    // Given
    const date = '2021-03-24T22:07:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('24/03/2021 à 22h07')
  })

  it('getDateTime Should respect the timezone given', () => {
    // Given
    const date = '2021-03-25T00:07:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('25/03/2021 à 00h07')
  })

  it('getDateTime Should respect another timezone given', () => {
    // Given
    const date = '2021-04-06T23:24:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('06/04/2021 à 23h24')
  })
})
