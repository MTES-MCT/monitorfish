import { monitorfishApi } from '.'
import { HttpStatusCode } from './constants'

export const fleetSegmentApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    // TODO This type must be somewhere.
    getInfractions: builder.query<
      Array<{
        infraction: string
        infractionCategory: string
        natinfCode: string
        regulation: string
      }>,
      void
    >({
      providesTags: () => [{ type: 'Infractions' }],
      query: () => `infractions`
    })
  })
})

export const { useGetInfractionsQuery } = fleetSegmentApi

export const INFRACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les NATINFs"

/**
 * Get fishing infractions
 * @memberOf API
 * @returns {Promise<Infraction[]>} The infractions
 * @throws {Error}
 */
function getFishingInfractionsFromAPI() {
  return fetch('/bff/v1/infractions')
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      }
      response.text().then(text => {
        // eslint-disable-next-line no-console
        console.error(text)
      })
      throw Error(INFRACTIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error)
      throw Error(INFRACTIONS_ERROR_MESSAGE)
    })
}

export { getFishingInfractionsFromAPI }
