import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ky from 'ky'

import { getEnvironmentVariable } from './api'
import { ApiError } from '../libs/ApiError'

import type { Mission } from '../domain/types/mission'
import type { MissionControlsSummary } from '../domain/types/missionAction'

const MISSION_ACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les contrôles de ce navire"

const MONITORENV_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

export const missionApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${MONITORENV_URL}/api/v1/`
  }),
  endpoints: builder => ({
    getAll: builder.query<Mission[], undefined>({
      query: () => `missions?startedAfterDateTime=&startedBeforeDateTime=`
    })
  }),
  reducerPath: 'missionApi'
})

/**
 * Get vessel controls
 *
 * @throws {@link ApiError}
 */
export async function getVesselControlsFromAPI(vesselId: number, fromDate: Date) {
  try {
    return await ky
      .get(`/bff/v1/mission_actions?vesselId=${vesselId}&afterDateTime=${fromDate.toISOString()}`)
      .json<MissionControlsSummary>()
  } catch (err) {
    throw new ApiError(MISSION_ACTIONS_ERROR_MESSAGE, err)
  }
}
