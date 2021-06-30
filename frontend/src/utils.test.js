import { getCoordinates, getDateTime } from './utils'
import { CoordinatesFormat, WSG84_PROJECTION } from './domain/entities/map'

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
    const date = '2021-04-06T23:10:00Z'

    // When
    const formattedDate = getDateTime(date, true)

    // Then
    expect(formattedDate).toEqual('06/04/2021 à 23h10')
  })

  it('getCoordinates Should get coordinates for a dummy lon/lat', async () => {
    // When
    const coordinates = getCoordinates([-4.276, 46.947], WSG84_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_SECONDS)

    // Then
    expect(coordinates).not.toBeUndefined()
    expect(coordinates[0]).toEqual('46° 56′ 50″  N')
    expect(coordinates[1]).toEqual('004°  16′ 34″ W')
  })

  it('getCoordinates Should get S coordinates for a dummy lon/lat', async () => {
    // When
    const coordinates = getCoordinates([4.591, -33.56], WSG84_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_SECONDS)

    // Then
    expect(coordinates).not.toBeUndefined()
    expect(coordinates[0]).toEqual('33° 33′ 37″  S')
    expect(coordinates[1]).toEqual('004°  35′ 28″ E')
  })

  it('getCoordinates Should get coordinates for a 0 longitude', async () => {
    // When
    const coordinates = getCoordinates([0, 49.6167], WSG84_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_SECONDS)

    // Then
    expect(coordinates).not.toBeUndefined()
    expect(coordinates[0]).toEqual('49° 37′ 01″  N')
    expect(coordinates[1]).toEqual('000°  00′ 00″')
  })
})
