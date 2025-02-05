/* eslint-disable @typescript-eslint/no-throw-literal */

import {LayerProperties, OPENLAYERS_PROJECTION, WSG84_PROJECTION} from '@features/Map/constants'
import GML from 'ol/format/GML'
import WFS from 'ol/format/WFS'

import {HttpStatusCode} from './constants'
import {RegulationActionType} from '../features/Regulation/utils'

import type {MonitorFishMap} from '@features/Map/Map.types'
import type {Regulation} from '@features/Regulation/Regulation.types'
import type {RegulatoryZone} from '@features/Regulation/types'
import type {GeoJSON} from 'domain/types/GeoJSON'
import type {Extent} from 'ol/extent'
import type {GeoJSONFeatureCollection} from 'ol/format/GeoJSON'
import {FrontendApiError} from "@libs/FrontendApiError";

export const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la couche réglementaire"
const REGULATORY_ZONES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les zones réglementaires"
const REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE = "Nous n'avons pas pu filtrer les zones réglementaires par zone"
const GEOMETRY_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des tracés"
const UPDATE_REGULATION_MESSAGE =
  'Une erreur est survenue lors de la mise à jour de la zone réglementaire dans GeoServer'

function throwIrretrievableAdministrativeZoneError(e, type) {
  throw new FrontendApiError(`Nous n'avons pas pu récupérer la zone ${type}`, e)
}

function getIrretrievableRegulatoryZoneError(e, regulatoryZone) {
  return Error(
    `Nous n'avons pas pu récupérer la zone réglementaire ${regulatoryZone.topic}/${regulatoryZone.zone} : ${e}`
  )
}

export const GEOSERVER_URL = import.meta.env.FRONTEND_GEOSERVER_REMOTE_URL
export const GEOSERVER_BACKOFFICE_URL = import.meta.env.FRONTEND_GEOSERVER_LOCAL_URL

/**
 * @description This API isn't authenticated
 */
function getAllRegulatoryLayersFromAPI(fromBackoffice): Promise<Regulation.RegulatoryZoneGeoJsonFeatureCollection> {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  return fetch(
    `${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
      `${LayerProperties.REGULATORY.code}&outputFormat=application/json&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region,next_id`
  )
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
    })
    .catch(error => {
      if (import.meta.env.DEV) {
        return {
          features: []
        }
      }

      console.error(error)
      throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
    })
}

/**
 * Get geometry object of regulatory area without regulation reference
 * @description This API isn't authenticated
 * @memberOf API
 * @param {boolean} fromBackoffice - From backoffice
 * @returns {Promise<GeoJSON>} The geometry as GeoJSON feature
 * @throws {Error}
 */
function getAllGeometryWithoutProperty(fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  const filter =
    'regulatory_references IS NULL AND zone IS NULL AND region IS NULL AND law_type IS NULL AND topic IS NULL'
  const REQUEST =
    `${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
    `${LayerProperties.REGULATORY.code}&outputFormat=application/json&propertyName=geometry,id&CQL_FILTER=${filter
      .replace(/'/g, '%27')
      .replace(/ /g, '%20')}`

  return fetch(REQUEST)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(GEOMETRY_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(GEOMETRY_ERROR_MESSAGE)
    })
}

/**
 * Get the administrative zone GeoJSON feature
 * @description This API isn't authenticated
 */
export async function getAdministrativeZoneFromAPI(
  administrativeZone: string,
  extent: Extent | undefined,
  subZone: string | undefined,
  fromBackoffice: boolean
) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  return fetch(getAdministrativeZoneURL(administrativeZone, extent, subZone, geoserverURL))
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response
          .json()
          .then(body => body)
          .catch(e => {
            throwIrretrievableAdministrativeZoneError(e, administrativeZone)
          })
      }

      return response.text().then(bodyAsText => {
        throwIrretrievableAdministrativeZoneError(bodyAsText, administrativeZone)
      })
    })
    .catch(e => {
      throwIrretrievableAdministrativeZoneError(e, administrativeZone)
    })
}

/**
 * Get the administrative zone Geoserver URL
 * @description This API isn't authenticated
 */
function getAdministrativeZoneURL(
  type: string,
  extent: Extent | undefined,
  subZone: string | undefined,
  geoserverURL: string
): string {
  let extentFilter = ''
  if (extent) {
    extentFilter = `&bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}`
  }

  let subZoneFilter = ''
  if (subZone) {
    const filter = `${subZone.replace(/'/g, "''")}`

    subZoneFilter = `&featureID=${filter.replace(/'/g, '%27').replace(/ /g, '%20')}`
  }

  return (
    `${geoserverURL}/geoserver/wfs?service=WFS&` +
    `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
    `outputFormat=application/json&srsname=${WSG84_PROJECTION}${extentFilter}${subZoneFilter}`
  )
}

/**
 * @description This API isn't authenticated
 */
export async function getRegulatoryZoneFromAPI(
  type: string,
  regulatoryZone: MonitorFishMap.ShowedLayer,
  fromBackoffice: boolean
): Promise<Regulation.RegulatoryZoneGeoJsonFeature> {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return await fetch(getRegulatoryZoneURL(type, regulatoryZone, geoserverURL))
      .then(response => {
        if (response.status === HttpStatusCode.OK) {
          return response
            .json()
            .then(body => getFirstFeature(body))
            .catch(e => {
              throw getIrretrievableRegulatoryZoneError(e, regulatoryZone)
            })
        }

        return response.text().then(bodyAsText => {
          throw getIrretrievableRegulatoryZoneError(bodyAsText, regulatoryZone)
        })
      })
      .catch(e => {
        throw getIrretrievableRegulatoryZoneError(e, regulatoryZone)
      })
  } catch (e) {
    return Promise.reject(getIrretrievableRegulatoryZoneError(e, regulatoryZone))
  }
}

/**
 * @description This API isn't authenticated
 */
function getRegulatoryZoneURL(type: string, regulatoryZone: MonitorFishMap.ShowedLayer, geoserverURL: string) {
  if (!regulatoryZone.topic) {
    throw new Error("Le nom de la couche n'est pas renseigné")
  }
  if (!regulatoryZone.zone) {
    throw new Error("Le nom de la zone n'est pas renseigné")
  }

  const filter = `topic='${encodeURIComponent(regulatoryZone.topic).replace(
    /'/g,
    "''"
  )}' AND zone='${encodeURIComponent(regulatoryZone.zone).replace(/'/g, "''")}'`

  return (
    `${geoserverURL}/geoserver/wfs?service=WFS` +
    `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
    `&outputFormat=application/json&CQL_FILTER=${filter.replace(/'/g, '%27').replace(/ /g, '%20')}`
  )
}

/**
 * Get the regulatory zones GeoJSON feature filtered with the OpenLayers extent (the BBOX)
 * @description This API isn't authenticated
 */
export function getRegulatoryZonesInExtentFromAPI(
  extent: Extent,
  fromBackoffice: boolean
): Promise<GeoJSONFeatureCollection> {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return fetch(
      `${geoserverURL}/geoserver/wfs?service=WFS` +
        `&version=1.1.0&request=GetFeature&typename=monitorfish:${LayerProperties.REGULATORY.code}` +
        `&outputFormat=application/json&srsname=${WSG84_PROJECTION}` +
        `&bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}${'&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region'
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/ /g, '%20')}`
    )
      .then(response => {
        if (response.status === HttpStatusCode.OK) {
          return response
            .json()
            .then(body => body)
            .catch(error => {
              console.error(error)
              throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
            })
        }

        return response.text().then(bodyAsText => {
          console.error(bodyAsText)
          throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
        })
      })
      .catch(error => {
        console.error(error)
        throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
      })
  } catch (error) {
    console.error(error)

    return Promise.reject(REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE)
  }
}

function getFirstFeature(response) {
  // There must be only one feature per regulation
  const FIRST_FEATURE = 0

  if (response.features.length === 1 && response.features[FIRST_FEATURE]) {
    return response.features[FIRST_FEATURE]
  }
  throw Error('We found multiple features for this zone')
}

/**
 * @description This API isn't authenticated
 */
function getRegulatoryFeatureMetadataFromAPI(
  partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>,
  fromBackoffice: boolean
): Promise<Regulation.RegulatoryZoneGeoJsonFeature> {
  let url
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    url = getRegulatoryZoneURL(LayerProperties.REGULATORY.code, partialRegulatoryZone, geoserverURL)
  } catch (e) {
    return Promise.reject(e)
  }

  return fetch(url)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json().then(body => getFirstFeature(body))
      }

      return response.text().then(bodyAsText => {
        console.error(bodyAsText)
        throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
      })
    })
    .catch(error => {
      console.error(error)
      throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
    })
}

/**
 * @description This API isn't authenticated
 */
function getAdministrativeSubZonesFromAPI(
  type: string,
  fromBackoffice: boolean
): Promise<GeoJSON.FeatureCollection<any, string>> {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  let query
  if (type === LayerProperties.FAO.code) {
    const filter = "f_level='DIVISION'"

    query =
      `${geoserverURL}/geoserver/wfs?service=WFS&` +
      `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
      `outputFormat=application/json&srsname=${WSG84_PROJECTION}&CQL_FILTER=${filter
        .replace(/'/g, '%27')
        .replace(/ /g, '%20')}`
  } else {
    query =
      `${geoserverURL}/geoserver/wfs?service=WFS&` +
      `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
      `outputFormat=application/json&srsname=${WSG84_PROJECTION}`
  }

  return fetch(query)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response
          .json()
          .then(body => body)
          .catch(e => {
            throwIrretrievableAdministrativeZoneError(e, type)
          })
      }

      return response.text().then(bodyAsText => {
        throwIrretrievableAdministrativeZoneError(bodyAsText, type)
      })
    })
    .catch(e => {
      if (import.meta.env.DEV) {
        return {
          features: []
        }
      }

      return throwIrretrievableAdministrativeZoneError(e, type)
    })
}

/**
 * @description This API isn't authenticated
 */
function sendRegulationTransaction(feature, actionType) {
  const formatWFS = new WFS()
  const formatGML = new GML({
    featureNS: 'monitorfish',
    featureType: 'monitorfish:regulations_write',
    srsName: 'EPSG:4326'
  })

  const xs = new XMLSerializer()
  let transaction
  // TODO `null` doesn't seem to an expected parameter value for `writeTransaction` method.
  if (actionType === RegulationActionType.Update) {
    // @ts-ignore
    transaction = formatWFS.writeTransaction(null, [feature], null, formatGML)
  } else if (actionType === RegulationActionType.Insert) {
    // @ts-ignore
    transaction = formatWFS.writeTransaction([feature], null, null, formatGML)
  } else if (actionType === RegulationActionType.Delete) {
    // @ts-ignore
    transaction = formatWFS.writeTransaction(null, null, [feature], formatGML)
  }
  const payload = xs.serializeToString(transaction)

  return fetch(`${GEOSERVER_BACKOFFICE_URL}/geoserver/wfs`, {
    body: payload.replace('feature:', ''),
    headers: {
      'Content-Type': 'text/xml',
      'Data-Type': 'xml',
      'Process-Data': 'false'
    },
    method: 'POST',
    mode: 'no-cors'
  })
    .then(r => r)
    .catch(error => {
      console.error(error)
      throw Error(UPDATE_REGULATION_MESSAGE)
    })
}

export {
  sendRegulationTransaction,
  getAdministrativeSubZonesFromAPI,
  getRegulatoryFeatureMetadataFromAPI,
  getRegulatoryZoneURL,
  getAdministrativeZoneURL,
  getAllGeometryWithoutProperty,
  getAllRegulatoryLayersFromAPI
}
