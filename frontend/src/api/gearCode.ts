import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApiKy } from './api'

import type { Gear } from '../domain/types/Gear'

export const GEAR_CODES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les codes des engins de pêches"

async function getAllGearsFromAPI() {
  try {
    return await monitorfishApiKy.get(`/bff/v1/gears`).json<Array<Gear>>()
  } catch (err) {
    throw new FrontendApiError(GEAR_CODES_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export { getAllGearsFromAPI }
