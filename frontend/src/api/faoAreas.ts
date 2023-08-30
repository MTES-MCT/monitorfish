import { monitorfishApi, monitorfishApiKy } from './index'
import { ApiError } from '../libs/ApiError'

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
          params.latitude || ''
        }&longitude=${params.longitude || ''}&portLocode=${params.portLocode || ''}`
    })
  })
})

export const { useComputeVesselFaoAreasQuery } = faoAreasApi

/**
 * Get FAO areas
 *
 * @throws {ApiError}
 */
async function getFAOAreasFromAPI() {
  try {
    return await monitorfishApiKy.get(`/bff/v1/fao_areas`).json<Array<string>>()
  } catch (err) {
    throw new ApiError(FAO_AREAS_ERROR_MESSAGE, err)
  }
}

export { getFAOAreasFromAPI }
