import { getDateTime, getCoordinates } from './utils'
import { WSG84_PROJECTION } from './domain/entities/map'

describe('utils', () => {
    it('getDateTime Should respect the timezone given fur UTC', async () => {
        // Given
        let date = "2021-03-24T22:07:00Z"

        // When
        let formattedDate = getDateTime(date, true)

        // Then
        expect(formattedDate).toEqual("24/03/2021 à 22h07")
    })

    it('getDateTime Should respect the timezone given', async () => {
        // Given
        let date = "2021-03-25T00:07:00Z"

        // When
        let formattedDate = getDateTime(date, true)

        // Then
        expect(formattedDate).toEqual("25/03/2021 à 00h07")
    })

    it('getDateTime Should respect another timezone given', async () => {
        // Given
        let date = "2021-04-06T23:10:00Z"

        // When
        let formattedDate = getDateTime(date, true)

        // Then
        expect(formattedDate).toEqual("06/04/2021 à 23h10")
    })

    it('getCoordinates Should get coordinates for a 0 longitude', async () => {
        // When
        let coordinates = getCoordinates([49.6167, 0], WSG84_PROJECTION)

        // Then
        expect(coordinates).not.toBeUndefined()
        expect(coordinates[0]).toEqual('0° 00′ 00″')
        expect(coordinates[1]).toEqual('049°  37′ 01″ E')
    })

})
