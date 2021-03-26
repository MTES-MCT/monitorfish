import { getDateTime } from './utils'

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
})
