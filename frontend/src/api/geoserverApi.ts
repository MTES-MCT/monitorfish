import { LayerProperties, WSG84_PROJECTION } from '@features/Map/constants'
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { GEOSERVER_BACKOFFICE_URL, GEOSERVER_URL } from './geoserver'

import type { CustomResponseError } from './types'
import type { FeatureCollection } from 'geojson'

const ADMINISTRATIVE_ZONE_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la zone"

export type GetAdministrativeSubZonesParams = {
  fromBackoffice: boolean
  sortBy?: string | undefined
  type: string
}

export const geoserverApi = createApi({
  baseQuery: fakeBaseQuery<CustomResponseError>(),
  endpoints: builder => ({
    getAdministrativeSubZones: builder.query<FeatureCollection, GetAdministrativeSubZonesParams>({
      queryFn: async ({ fromBackoffice, sortBy, type }) => {
        const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL
        const url = buildAdministrativeSubZonesUrl(type, geoserverURL, sortBy)

        try {
          const response = await fetch(url)
          if (response.ok) {
            const data: FeatureCollection = await response.json()

            return { data }
          }

          const bodyAsText = await response.text()

          const error: CustomResponseError = {
            path: url,
            requestData: undefined,
            responseData: { code: null, data: bodyAsText, type: null },
            status: response.status
          }

          return { error }
        } catch (e) {
          if (import.meta.env.DEV) {
            return {
              data: {
                features: [],
                type: 'FeatureCollection'
              }
            }
          }

          const error: CustomResponseError = {
            path: url,
            requestData: undefined,
            responseData: {
              code: null,
              data: `${ADMINISTRATIVE_ZONE_ERROR_MESSAGE} ${type}`,
              type: null
            },
            status: 'FETCH_ERROR'
          }

          return { error }
        }
      }
    })
  }),
  reducerPath: 'geoserverApi',
  tagTypes: []
})

function buildAdministrativeSubZonesUrl(type: string, geoserverURL: string, sortBy?: string): string {
  const sortByQuery = sortBy ? `&sortBy=${sortBy}` : ''
  const baseUrl = `${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:${type}&outputFormat=application/json&srsname=${WSG84_PROJECTION}`

  if (type === LayerProperties.FAO.code) {
    const filter = "f_level='DIVISION'"

    return `${baseUrl}&CQL_FILTER=${filter.replace(/'/g, '%27').replace(/ /g, '%20')}${sortByQuery}`
  }

  return `${baseUrl}${sortByQuery}`
}

export const { useGetAdministrativeSubZonesQuery } = geoserverApi
