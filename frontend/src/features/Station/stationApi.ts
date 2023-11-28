import { monitorenvApi } from '../../api/api'
import { FrontendApiError } from '../../libs/FrontendApiError'

import type { Station } from '@mtes-mct/monitor-ui'

const GET_STATION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer cette base."
const GET_STATIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des bases."

export const monitorenvStationApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getStation: builder.query<Station.Station, number>({
      providesTags: () => [{ type: 'Stations' }],
      query: stationId => `/v1/stations/${stationId}`,
      transformErrorResponse: response => new FrontendApiError(GET_STATION_ERROR_MESSAGE, response)
    }),

    getStations: builder.query<Station.Station[], void>({
      providesTags: () => [{ type: 'Stations' }],
      query: () => `/v1/stations`,
      transformErrorResponse: response => new FrontendApiError(GET_STATIONS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetStationQuery, useGetStationsQuery } = monitorenvStationApi
