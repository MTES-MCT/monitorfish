import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApiKy } from './api'

import type { SpeciesAndSpeciesGroupsAPIData } from '../domain/types/specy'

export const SPECIES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les espèces"

/**
 * Get all species
 *
 * @throws {FrontendApiError}
 */
async function getAllSpeciesFromAPI() {
  try {
    return await monitorfishApiKy.get(`/bff/v1/species`).json<SpeciesAndSpeciesGroupsAPIData>()
  } catch (err) {
    throw new FrontendApiError(SPECIES_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export { getAllSpeciesFromAPI }
