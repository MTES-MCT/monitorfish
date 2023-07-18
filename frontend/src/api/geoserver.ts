/* eslint-disable no-console, no-restricted-globals */

import { logSoftError } from '@mtes-mct/monitor-ui'
import GML from 'ol/format/GML'
import WFS from 'ol/format/WFS'

import { HttpStatusCode } from './constants'
import { LayerProperties } from '../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map/constants'
import { REGULATION_ACTION_TYPE } from '../domain/entities/regulation'
import { ApiError } from '../libs/ApiError'

import type { RegulatoryZone } from '../domain/types/regulation'
import type { Extent } from 'ol/extent'
import type { GeoJSON } from 'ol/format'

export const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la couche réglementaire"
const REGULATORY_ZONES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les zones réglementaires"
const REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE = "Nous n'avons pas pu filtrer les zones réglementaires par zone"
const GEOMETRY_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des tracés"
const UPDATE_REGULATION_MESSAGE =
  'Une erreur est survenue lors de la mise à jour de la zone réglementaire dans GeoServer'

function throwIrretrievableAdministrativeZoneError(err: unknown, type: string): never {
  throw new ApiError(`Nous n'avons pas pu récupérer la zone ${type}`, err)
}

function getIrretrievableRegulatoryZoneError(err: unknown, regulatoryZone: RegulatoryZone): Error {
  return Error(
    `Nous n'avons pas pu récupérer la zone réglementaire ${regulatoryZone.topic}/${regulatoryZone.zone} : ${err}`
  )
}

export const GEOSERVER_URL =
  (self as any)?.env?.REACT_APP_GEOSERVER_REMOTE_URL !== '__REACT_APP_GEOSERVER_REMOTE_URL__'
    ? (self as any).env.REACT_APP_GEOSERVER_REMOTE_URL
    : process.env.REACT_APP_GEOSERVER_REMOTE_URL
export const GEOSERVER_BACKOFFICE_URL =
  (self as any)?.env?.REACT_APP_GEOSERVER_LOCAL_URL !== '__REACT_APP_GEOSERVER_LOCAL_URL__'
    ? (self as any).env.REACT_APP_GEOSERVER_LOCAL_URL
    : process.env.REACT_APP_GEOSERVER_LOCAL_URL

/**
 * @unauthenticated
 */
function getAllRegulatoryLayersFromAPI(fromBackoffice) {
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
      if (process.env.NODE_ENV === 'development') {
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
 *
 * @returns The geometry as GeoJSON feature
 *
 * @unauthenticated
 */
function getAllGeometryWithoutProperty(isFromBackoffice: boolean): Promise<GeoJSON> {
  const geoserverURL = isFromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

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
 *
 * @returns The feature GeoJSON
 *
 * @unauthenticated
 */
// eslint-disable-next-line consistent-return
async function getAdministrativeZoneFromAPI(
  administrativeZone: string,
  extent: Extent | null,
  subZone: string | null,
  isFromBackoffice: boolean
): Promise<GeoJSON> {
  try {
    const geoserverURL = isFromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL
    const url = getAdministrativeZoneURL(administrativeZone, extent, subZone, geoserverURL)

    const response = await fetch(url)
    if (response.status !== HttpStatusCode.OK) {
      throw await response.text()
    }

    const administrativeZoneGeoJson = await response.json()

    return administrativeZoneGeoJson
  } catch (err) {
    throwIrretrievableAdministrativeZoneError(err, administrativeZone)
  }
}

/**
 * Get the administrative zone Geoserver URL
 *
 * @returns The zone URL WFS request
 *
 * @unauthenticated
 */
function getAdministrativeZoneURL(type: string, extent: Extent | null, subZone: string | null, geoserverURL: string) {
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
 * @unauthenticated
 */
async function getRegulatoryZoneFromAPI(
  type: string,
  regulatoryZone: RegulatoryZone,
  isFromBackoffice: boolean
): Promise<GeoJSON> {
  try {
    const geoserverURL = isFromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL
    const url = getRegulatoryZoneURL(type, regulatoryZone, geoserverURL)

    const response = await fetch(url)
    if (response.status !== HttpStatusCode.OK) {
      throw await response.text()
    }

    const features = await response.json()
    const regulatoryZoneGeoJson = getFirstFeature(features)

    return regulatoryZoneGeoJson
  } catch (err) {
    throw getIrretrievableRegulatoryZoneError(err, regulatoryZone)
  }
}

/**
 * @unauthenticated
 */
function getRegulatoryZoneURL(type, regulatoryZone, geoserverURL) {
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
 *
 * @unauthenticated
 */
export function getRegulatoryZonesInExtentFromAPI(extent: Extent, fromBackoffice: boolean): Promise<GeoJSON> {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return fetch(
      `${geoserverURL}/geoserver/wfs?service=WFS` +
        `&version=1.1.0&request=GetFeature&typename=monitorfish:${LayerProperties.REGULATORY.code}` +
        `&outputFormat=application/json&srsname=${WSG84_PROJECTION}` +
        `&bbox=${extent.join(
          ','
        )},${OPENLAYERS_PROJECTION}${'&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region'
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/ /g, '%20')}`
    )
      .then(response => {
        if (response.status === HttpStatusCode.OK) {
          return response
            .json()
            .then(_response => _response)
            .catch(error => {
              console.error(error)
              // eslint-disable-next-line @typescript-eslint/no-throw-literal
              throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
            })
        }
        response.text().then(_response => {
          console.error(_response)
        })
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
      })
      .catch(error => {
        console.error(error)
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
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
 * @unauthenticated
 */
async function getRegulatoryFeatureMetadataFromAPI(regulatorySubZone, isFromBackoffice: boolean) {
  try {
    const geoserverURL = isFromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL
    const url = getRegulatoryZoneURL(LayerProperties.REGULATORY.code, regulatorySubZone, geoserverURL)

    const response = await fetch(url)
    if (response.status === HttpStatusCode.OK) {
      console.error(await response.text())
      throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
    }

    const regulatoryFeatureMetadataFeatures = await response.json()
    const regulatoryFeatureMetadata = getFirstFeature(regulatoryFeatureMetadataFeatures)

    return regulatoryFeatureMetadata
  } catch (err) {
    console.error(err)
    throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
  }
}

/**
 * @unauthenticated
 */
// eslint-disable-next-line consistent-return
async function getAdministrativeSubZonesFromAPI(type: string, isFromBackoffice: boolean) {
  try {
    const geoserverURL = isFromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

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

    const response = await fetch(query)

    if (response.status === HttpStatusCode.OK) {
      const responseBody = await response.text()

      throwIrretrievableAdministrativeZoneError(responseBody, type)
    }

    const administrativeSubZones = await response.json()

    return administrativeSubZones
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      return {
        features: []
      }
    }

    throwIrretrievableAdministrativeZoneError(err, type)
  }
}

/**
 * @unauthenticated
 */
function sendRegulationTransaction(feature, actionType) {
  const formatWFS = new WFS()
  const formatGML = new GML({
    featureNS: 'monitorfish',
    featureType: 'monitorfish:regulations_write',
    srsName: 'EPSG:4326'
  })

  const xs = new XMLSerializer()
  let transaction: Node
  // TODO Are `ol` types wrong?
  if (actionType === REGULATION_ACTION_TYPE.UPDATE) {
    transaction = formatWFS.writeTransaction([], [feature], [], formatGML as any)
  } else if (actionType === REGULATION_ACTION_TYPE.INSERT) {
    transaction = formatWFS.writeTransaction([feature], [], [], formatGML as any)
  } else if (actionType === REGULATION_ACTION_TYPE.DELETE) {
    transaction = formatWFS.writeTransaction([], [], [feature], formatGML as any)
  } else {
    logSoftError({
      context: { actionType },
      message: 'Unbale to handle this `actionType` value.',
      userMessage: 'GeoServer a rencontré un problème.'
    })

    return undefined
  }
  const payload = xs.serializeToString(transaction)

  return fetch(`${GEOSERVER_BACKOFFICE_URL}/geoserver/wfs`, {
    body: payload.replace('feature:', ''),
    headers: {
      'Content-Type': 'text/xml'
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
  getRegulatoryZoneFromAPI,
  getAdministrativeZoneURL,
  getAdministrativeZoneFromAPI,
  getAllGeometryWithoutProperty,
  getAllRegulatoryLayersFromAPI
}
