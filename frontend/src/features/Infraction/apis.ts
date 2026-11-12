import { monitorfishPublicApi } from '@api/api'

import type { Infraction, Threat } from '@features/Infraction/types'

export const infractionApi = monitorfishPublicApi.injectEndpoints({
  endpoints: builder => ({
    getInfractions: builder.query<Infraction[], void>({
      providesTags: () => [{ type: 'Infractions' }],
      query: () => `/v1/infractions`
    }),
    getThreatCharacterizations: builder.query<Threat[], void>({
      query: () => `/v1/infractions/threats`
    })
  })
})

export const { useGetInfractionsQuery, useGetThreatCharacterizationsQuery } = infractionApi

export const INFRACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les NATINFs"
