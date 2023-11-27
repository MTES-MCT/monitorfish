import { monitorfishApiKy } from './api'
import { ApiError } from '../libs/ApiError'

import type { NOTIFICATION_TYPE, UserType } from '../domain/entities/beaconMalfunction/constants'
import type {
  BeaconMalfunction,
  BeaconMalfunctionResumeAndDetails,
  UpdateBeaconMalfunction,
  VesselBeaconMalfunctionsResumeAndHistory
} from '../domain/entities/beaconMalfunction/types'
import type { VesselId } from '../domain/entities/vessel/types'

export const ARCHIVE_BEACON_MALFUNCTION = "Nous n'avons pas pu archiver les avaries VMS"
export const GET_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les avaries VMS"
export const GET_BEACON_MALFUNCTION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer l'avarie VMS"
export const UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour le statut de l'avarie VMS"
export const SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE =
  "Nous n'avons pas pu ajouter le commentaire sur l'avarie VMS"
export const GET_VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les avaries de ce navire"
export const SEND_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu envoyer la notification"

/**
 * Get all beacon malfunctions
 *
 * @throws {@link ApiError}
 */
async function getAllBeaconMalfunctionsFromAPI(): Promise<BeaconMalfunction[]> {
  try {
    return await monitorfishApiKy.get('/bff/v1/beacon_malfunctions').json<BeaconMalfunction[]>()
  } catch (err) {
    throw new ApiError(GET_BEACON_MALFUNCTIONS_ERROR_MESSAGE, err)
  }
}

/**
 * Update a beacon malfunction
 *
 * @throws {@link ApiError}
 */
async function updateBeaconMalfunctionFromAPI(
  id: number,
  updatedFields: UpdateBeaconMalfunction
): Promise<BeaconMalfunctionResumeAndDetails> {
  try {
    return await monitorfishApiKy
      .put(`/bff/v1/beacon_malfunctions/${id}`, {
        json: updatedFields
      })
      .json<BeaconMalfunctionResumeAndDetails>()
  } catch (err) {
    throw new ApiError(UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE, err)
  }
}

/**
 * Get a beacon malfunction
 *
 * @throws {@link ApiError}
 */
async function getBeaconMalfunctionFromAPI(id: number): Promise<BeaconMalfunctionResumeAndDetails> {
  try {
    return await monitorfishApiKy.get(`/bff/v1/beacon_malfunctions/${id}`).json<BeaconMalfunctionResumeAndDetails>()
  } catch (err) {
    throw new ApiError(GET_BEACON_MALFUNCTION_ERROR_MESSAGE, err)
  }
}

/**
 * Save a new comment attached to a beacon malfunction
 *
 * @throws {@link ApiError}
 */
async function saveBeaconMalfunctionCommentFromAPI(
  id: number,
  comment: { comment: string; userType: keyof typeof UserType }
): Promise<BeaconMalfunctionResumeAndDetails> {
  try {
    return await monitorfishApiKy
      .post(`/bff/v1/beacon_malfunctions/${id}/comments`, {
        json: comment
      })
      .json<BeaconMalfunctionResumeAndDetails>()
  } catch (err) {
    throw new ApiError(SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE, err)
  }
}

/**
 * Get vessel beacon malfunctions
 *
 * @throws {@link ApiError}
 */
async function getVesselBeaconsMalfunctionsFromAPI(
  vesselId: VesselId,
  fromDate: Date
): Promise<VesselBeaconMalfunctionsResumeAndHistory> {
  try {
    return await monitorfishApiKy
      .get(`/bff/v1/vessels/beacon_malfunctions?vesselId=${vesselId}&afterDateTime=${fromDate.toISOString()}`)
      .json<VesselBeaconMalfunctionsResumeAndHistory>()
  } catch (err) {
    throw new ApiError(GET_VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE, err)
  }
}

/**
 * Send a notification - Update the request notification column to asynchronously send the message
 *
 * @throws {@link ApiError}
 */
async function sendNotificationFromAPI(
  id: number,
  notificationType: keyof typeof NOTIFICATION_TYPE,
  foreignFmcCode?: string
): Promise<void> {
  try {
    await monitorfishApiKy.put(
      `/bff/v1/beacon_malfunctions/${id}/${notificationType}?requestedNotificationForeignFmcCode=${foreignFmcCode}`
    )
  } catch (err) {
    throw new ApiError(SEND_NOTIFICATION_ERROR_MESSAGE, err)
  }
}

/**
 * Archive multiple beacon malfunctions
 *
 * @throws {@link ApiError}
 */
async function archiveBeaconMalfunctionsFromAPI(ids: number[]): Promise<BeaconMalfunctionResumeAndDetails[]> {
  try {
    return await monitorfishApiKy
      .put(`/bff/v1/beacon_malfunctions/archive`, {
        json: ids
      })
      .json<BeaconMalfunctionResumeAndDetails[]>()
  } catch (err) {
    throw new ApiError(ARCHIVE_BEACON_MALFUNCTION, err)
  }
}

export {
  getVesselBeaconsMalfunctionsFromAPI,
  saveBeaconMalfunctionCommentFromAPI,
  getBeaconMalfunctionFromAPI,
  updateBeaconMalfunctionFromAPI,
  getAllBeaconMalfunctionsFromAPI,
  sendNotificationFromAPI,
  archiveBeaconMalfunctionsFromAPI
}
