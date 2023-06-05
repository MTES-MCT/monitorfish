import { monitorfishApiKy } from './index'
import { ApiError } from '../libs/ApiError'

import type { SpeciesAndSpeciesGroupsAPIData } from '../domain/types/specy'

export const SPECIES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les espèces"

/**
 * Get all species
 *
 * @throws {ApiError}
 */
async function getAllSpeciesFromAPI() {
  try {
    return await monitorfishApiKy.get(`/bff/v1/species`).json<SpeciesAndSpeciesGroupsAPIData>()
  } catch (err) {
    throw new ApiError(SPECIES_ERROR_MESSAGE, err)
  }
}

export { getAllSpeciesFromAPI }
