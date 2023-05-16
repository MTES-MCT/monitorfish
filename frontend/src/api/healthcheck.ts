import { monitorfishApiKy } from './index'
import { ApiError } from '../libs/ApiError'

import type { Healthcheck } from '../domain/types/healthcheck'

export const HEALTH_CHECK_ERROR_MESSAGE = "Nous n'avons pas pu vérifier si l'application est à jour"

/**
 * Get application healthcheck
 *
 * @throws {@link ApiError}
 */
export async function getHealthcheckFromAPI(): Promise<Healthcheck> {
  try {
    return await monitorfishApiKy.get(`/bff/v1/healthcheck`).json<Healthcheck>()
  } catch (err) {
    throw new ApiError(HEALTH_CHECK_ERROR_MESSAGE, err)
  }
}
