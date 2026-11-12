import { AdminLayerProperties, LayerProperties, WSG84_PROJECTION } from '@features/Map/constants'
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { GEOSERVER_BACKOFFICE_URL, GEOSERVER_URL, getRegulatoryZonesURL, getRegulatoryZoneURL } from './geoserver'

import type { CustomResponseError } from './types'
import type { Regulation } from '@features/Regulation/Regulation.types'
import type { FeatureCollection } from 'geojson'

const ADMINISTRATIVE_ZONE_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la zone"

export type GetAdministrativeSubZonesParams = {
  fromBackoffice: boolean
  sortBy?: string | undefined
  type: string
}

export type RegulatoryZoneName = {
  topic: string
  zone: string
}

export type GetRegulatoryZonesParams = {
  fromBackoffice: boolean
  zones: RegulatoryZoneName[]
}

export const REGULATORY_ZONES_TAG = 'RegulatoryZones'
// Keeps the URL far below the 8 KB request line limit of Apache and Tomcat (~250 characters per zone at most)
const MAX_REGULATORY_ZONES_PER_REQUEST = 10

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
        } catch {
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
    }),

    getRegulatoryZones: builder.query<Regulation.RegulatoryZoneGeoJsonFeature[], GetRegulatoryZonesParams>({
      providesTags: [REGULATORY_ZONES_TAG],
      queryFn: async ({ fromBackoffice, zones }) => {
        const urls = getRegulatoryZonesUrls(zones, fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL)

        try {
          const featureCollections = await Promise.all(
            urls.map(async url => {
              const response = await fetch(url)
              if (!response.ok) {
                throw new Error(await response.text())
              }

              return (await response.json()) as Regulation.RegulatoryZoneGeoJsonFeatureCollection
            })
          )

          return { data: featureCollections.flatMap(({ features }) => features) }
        } catch (error) {
          const customError: CustomResponseError = {
            path: urls.join(' '),
            requestData: undefined,
            responseData: { code: null, data: String(error), type: null },
            status: 'FETCH_ERROR'
          }

          return { error: customError }
        }
      }
    })
  }),
  reducerPath: 'geoserverApi',
  tagTypes: [REGULATORY_ZONES_TAG]
})

function getRegulatoryZonesUrls(zones: RegulatoryZoneName[], geoserverURL: string): string[] {
  const urls: string[] = []
  for (let index = 0; index < zones.length; index += MAX_REGULATORY_ZONES_PER_REQUEST) {
    const zonesOfRequest = zones.slice(index, index + MAX_REGULATORY_ZONES_PER_REQUEST)
    // A single zone keeps the historical URL (cached and stubbed in E2E tests)
    urls.push(
      zonesOfRequest.length === 1 && zonesOfRequest[0]
        ? getRegulatoryZoneURL(LayerProperties.REGULATORY.code, zonesOfRequest[0], geoserverURL)
        : getRegulatoryZonesURL(LayerProperties.REGULATORY.code, zonesOfRequest, geoserverURL)
    )
  }

  return urls
}

function buildAdministrativeSubZonesUrl(type: string, geoserverURL: string, sortBy?: string): string {
  const sortByQuery = sortBy ? `&sortBy=${sortBy}` : ''
  const baseUrl = `${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:${type}&outputFormat=application/json&srsname=${WSG84_PROJECTION}`

  if (type === AdminLayerProperties.FAO.code) {
    const filter = "f_level='DIVISION'"

    return `${baseUrl}&CQL_FILTER=${filter.replace(/'/g, '%27').replace(/ /g, '%20')}${sortByQuery}`
  }

  return `${baseUrl}${sortByQuery}`
}

export const { useGetAdministrativeSubZonesQuery } = geoserverApi
