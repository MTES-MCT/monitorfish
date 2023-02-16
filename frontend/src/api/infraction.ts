import { monitorfishApi } from '.'
import { HttpStatusCode } from './constants'

import type { MissionAction } from '../domain/types/missionAction'

export const infractionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getInfractions: builder.query<MissionAction.Infraction[], void>({
      providesTags: () => [{ type: 'Infractions' }],
      query: () => `infractions`
    })
  })
})

export const { useGetInfractionsQuery } = infractionApi

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
