import { monitorfishApi } from '@api/api'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { NOTIFICATION_TYPE, UserType } from '@features/BeaconMalfunction/constants'
import type {
  BeaconMalfunction,
  BeaconMalfunctionResumeAndDetails,
  UpdateBeaconMalfunction,
  VesselBeaconMalfunctionsResumeAndHistory
} from '@features/BeaconMalfunction/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export const ARCHIVE_BEACON_MALFUNCTION = "Nous n'avons pas pu archiver les avaries VMS"
export const GET_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les avaries VMS"
export const GET_BEACON_MALFUNCTION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer l'avarie VMS"
export const UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour le statut de l'avarie VMS"
export const SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE =
  "Nous n'avons pas pu ajouter le commentaire sur l'avarie VMS"
export const GET_VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les avaries de ce navire"
export const SEND_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu envoyer la notification"

export const beaconMalfunctionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getAllBeaconMalfunctions: builder.query<BeaconMalfunction[], void>({
      query: () => ({
        method: 'GET',
        url: '/bff/v1/beacon_malfunctions'
      }),
      transformErrorResponse: response => new FrontendApiError(GET_BEACON_MALFUNCTIONS_ERROR_MESSAGE, response)
    }),

    getBeaconMalfunction: builder.query<BeaconMalfunctionResumeAndDetails, number>({
      query: id => ({
        method: 'GET',
        url: `/bff/v1/beacon_malfunctions/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(GET_BEACON_MALFUNCTION_ERROR_MESSAGE, response)
    }),

    getVesselBeaconsMalfunctions: builder.query<
      VesselBeaconMalfunctionsResumeAndHistory,
      { fromDate: Date; vesselId: Vessel.VesselId }
    >({
      query: ({ fromDate, vesselId }) => ({
        method: 'GET',
        params: {
          afterDateTime: fromDate.toISOString(),
          vesselId
        },
        url: '/bff/v1/vessels/beacon_malfunctions'
      }),
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE, response)
    }),

    saveBeaconMalfunctionComment: builder.mutation<
      BeaconMalfunctionResumeAndDetails,
      { comment: { comment: string; userType: keyof typeof UserType }; id: number }
    >({
      query: ({ comment, id }) => ({
        body: comment,
        method: 'POST',
        url: `/bff/v1/beacon_malfunctions/${id}/comments`
      }),
      transformErrorResponse: response => new FrontendApiError(SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE, response)
    }),

    sendNotification: builder.mutation<
      void,
      { foreignFmcCode: string | undefined; id: number; notificationType: keyof typeof NOTIFICATION_TYPE }
    >({
      query: ({ foreignFmcCode, id, notificationType }) => ({
        method: 'PUT',
        params: {
          requestedNotificationForeignFmcCode: foreignFmcCode
        },
        url: `/bff/v1/beacon_malfunctions/${id}/${notificationType}`
      }),
      transformErrorResponse: response => new FrontendApiError(SEND_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    updateBeaconMalfunction: builder.mutation<
      BeaconMalfunctionResumeAndDetails,
      { id: number; updatedFields: UpdateBeaconMalfunction }
    >({
      query: ({ id, updatedFields }) => ({
        body: updatedFields,
        method: 'PUT',
        url: `/bff/v1/beacon_malfunctions/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE, response)
    })
  })
})
