import { monitorfishPublicApi } from '../../api/api'

import type { Healthcheck } from './types'

export const HEALTH_CHECK_ERROR_MESSAGE = "Nous n'avons pas pu vérifier si l'application est à jour"

export const healthcheckApi = monitorfishPublicApi.injectEndpoints({
  endpoints: builder => ({
    getHealthcheck: builder.query<Healthcheck, void>({
      query: () => `/v1/healthcheck`
    })
  })
})

export const { useGetHealthcheckQuery } = healthcheckApi
