import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApi } from './api'

export const FAO_AREAS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les zones FAO"

export type ComputeVesselFaoAreasParams = {
  internalReferenceNumber: string | undefined
  latitude: number | undefined
  longitude: number | undefined
  portLocode: string | undefined
}

export const faoAreasApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    computeVesselFaoAreas: builder.query<string[], ComputeVesselFaoAreasParams>({
      query: params =>
        `/fao_areas/compute?internalReferenceNumber=${params.internalReferenceNumber}&latitude=${
          params.latitude ?? ''
        }&longitude=${params.longitude ?? ''}&portLocode=${params.portLocode ?? ''}`
    }),

    getFaoAreas: builder.query<string[], void>({
      query: () => '/fao_areass',
      transformErrorResponse: response => new FrontendApiError(FAO_AREAS_ERROR_MESSAGE, response)
    })
  })
})

export const { useComputeVesselFaoAreasQuery, useGetFaoAreasQuery } = faoAreasApi
