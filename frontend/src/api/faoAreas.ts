import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApi, monitorfishApiKy } from './api'

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
      query: () => '/fao_areas'
    })
  })
})

export const { useComputeVesselFaoAreasQuery, useGetFaoAreasQuery } = faoAreasApi

/**
 * Get FAO areas
 *
 * @throws {FrontendApiError}
 */
async function getFAOAreasFromAPI() {
  try {
    return await monitorfishApiKy.get(`/bff/v1/fao_areas`).json<Array<string>>()
  } catch (err) {
    throw new FrontendApiError(FAO_AREAS_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export { getFAOAreasFromAPI }
