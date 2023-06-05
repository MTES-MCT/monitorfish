import { monitorfishApiKy } from './index'
import { ApiError } from '../libs/ApiError'

export const FAO_AREAS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les zones FAO"

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
