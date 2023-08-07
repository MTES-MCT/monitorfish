import { LayerProperties } from '../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map/constants'
import WFS from 'ol/format/WFS'
import GML from 'ol/format/GML'
import { REGULATION_ACTION_TYPE } from '../domain/entities/regulation'
import { HttpStatusCode } from './constants'
import { ApiError } from '../libs/ApiError'

export const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer la couche réglementaire'
const REGULATORY_ZONES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les zones réglementaires'
const REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE = 'Nous n\'avons pas pu filtrer les zones réglementaires par zone'
const GEOMETRY_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer la liste des tracés'
const UPDATE_REGULATION_MESSAGE = 'Une erreur est survenue lors de la mise à jour de la zone réglementaire dans GeoServer'

function throwIrretrievableAdministrativeZoneError (e, type) {
  throw new ApiError(`Nous n'avons pas pu récupérer la zone ${type}`, e)
}

function getIrretrievableRegulatoryZoneError (e, regulatoryZone) {
  return Error(`Nous n'avons pas pu récupérer la zone réglementaire ${regulatoryZone.topic}/${regulatoryZone.zone} : ${e}`)
}

export const GEOSERVER_URL = self?.env?.REACT_APP_GEOSERVER_REMOTE_URL !== '__REACT_APP_GEOSERVER_REMOTE_URL__'
  ? self.env.REACT_APP_GEOSERVER_REMOTE_URL
  : process.env.REACT_APP_GEOSERVER_REMOTE_URL
export const GEOSERVER_BACKOFFICE_URL = self?.env?.REACT_APP_GEOSERVER_LOCAL_URL !== '__REACT_APP_GEOSERVER_LOCAL_URL__'
  ? self.env.REACT_APP_GEOSERVER_LOCAL_URL
  : process.env.REACT_APP_GEOSERVER_LOCAL_URL

/**
 * @description This API isn't authenticated
 */
function getAllRegulatoryLayersFromAPI (fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  return fetch(`${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
    `${LayerProperties.REGULATORY.code}&outputFormat=application/json&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region,next_id`)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
      }
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
 * @description This API isn't authenticated
 * @memberOf API
 * @param {boolean} fromBackoffice - From backoffice
 * @returns {Promise<GeoJSON>} The geometry as GeoJSON feature
 * @throws {Error}
 */
function getAllGeometryWithoutProperty (fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  const filter = 'regulatory_references IS NULL AND zone IS NULL AND region IS NULL AND law_type IS NULL AND topic IS NULL'
  const REQUEST = `${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
    `${LayerProperties.REGULATORY.code}&outputFormat=application/json&propertyName=geometry,id&CQL_FILTER=` + filter.replace(/'/g, '%27').replace(/ /g, '%20')
  return fetch(REQUEST)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(GEOMETRY_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(GEOMETRY_ERROR_MESSAGE)
    })
}

/**
 * Get the administrative zone GeoJSON feature
 * @description This API isn't authenticated
 * @memberOf API
 * @param {string} administrativeZone
 * @param {import("ol/extent.js").Extent|null} extent
 * @param {string|null} subZone
 * @param {boolean} fromBackoffice - From backoffice
 * @returns {Promise<GeoJSON>} The feature GeoJSON
 * @throws {Error}
 */
function getAdministrativeZoneFromAPI (administrativeZone, extent, subZone, fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  return fetch(getAdministrativeZoneURL(administrativeZone, extent, subZone, geoserverURL))
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json().then(response => {
          return response
        }).catch(e => {
          throwIrretrievableAdministrativeZoneError(e, administrativeZone)
        })
      } else {
        response.text().then(response => {
          throwIrretrievableAdministrativeZoneError(response, administrativeZone)
        })
      }
    }).catch(e => {
      throwIrretrievableAdministrativeZoneError(e, administrativeZone)
    })
}

/**
 * Get the administrative zone Geoserver URL
 * @description This API isn't authenticated
 * @memberOf API
 * @param {string} type
 * @param {string[]|null} extent
 * @param {string|null} subZone
 * @param {string} geoserverURL
 * @returns {string} - the zone URL WFS request
 */
function getAdministrativeZoneURL (type, extent, subZone, geoserverURL) {
  let extentFilter = ''
  if (extent) {
    extentFilter = `&bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}`
  }

  let subZoneFilter = ''
  if (subZone) {
    const filter = `${subZone.replace(/'/g, '\'\'')}`

    subZoneFilter = '&featureID=' + filter
      .replace(/'/g, '%27')
      .replace(/ /g, '%20')
  }

  return (
    `${geoserverURL}/geoserver/wfs?service=WFS&` +
    `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
    `outputFormat=application/json&srsname=${WSG84_PROJECTION}` + extentFilter + subZoneFilter
  )
}

/**
 * @description This API isn't authenticated
 */
function getRegulatoryZoneFromAPI (type, regulatoryZone, fromBackoffice) {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return fetch(getRegulatoryZoneURL(type, regulatoryZone, geoserverURL))
      .then(response => {
        if (response.status === HttpStatusCode.OK) {
          return response.json().then(response => {
            return getFirstFeature(response)
          }).catch(e => {
            throw getIrretrievableRegulatoryZoneError(e, regulatoryZone)
          })
        } else {
          response.text().then(response => {
            throw getIrretrievableRegulatoryZoneError(response, regulatoryZone)
          })
        }
      }).catch(e => {
        throw getIrretrievableRegulatoryZoneError(e, regulatoryZone)
      })
  } catch (e) {
    return Promise.reject(getIrretrievableRegulatoryZoneError(e, regulatoryZone))
  }
}

/**
 * @description This API isn't authenticated
 */
function getRegulatoryZoneURL (type, regulatoryZone, geoserverURL) {
  if (!regulatoryZone.topic) {
    throw new Error('Le nom de la couche n\'est pas renseigné')
  }
  if (!regulatoryZone.zone) {
    throw new Error('Le nom de la zone n\'est pas renseigné')
  }

  const filter = `topic='${encodeURIComponent(regulatoryZone.topic).replace(/'/g, '\'\'')}' AND zone='${encodeURIComponent(regulatoryZone.zone).replace(/'/g, '\'\'')}'`
  return `${geoserverURL}/geoserver/wfs?service=WFS` +
  `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
  '&outputFormat=application/json&CQL_FILTER=' +
  filter.replace(/'/g, '%27').replace(/ /g, '%20')
}

/**
 * Get the regulatory zones GeoJSON feature filtered with the OpenLayers extent (the BBOX)
 * @description This API isn't authenticated
 * @memberOf API
 * @param {number[]|null} extent
 * @param {boolean} fromBackoffice
 * @returns {Promise<GeoJSON>} The feature GeoJSON
 * @throws {Error}
 */
export function getRegulatoryZonesInExtentFromAPI (extent, fromBackoffice) {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return fetch(`${geoserverURL}/geoserver/wfs?service=WFS` +
      `&version=1.1.0&request=GetFeature&typename=monitorfish:${LayerProperties.REGULATORY.code}` +
      `&outputFormat=application/json&srsname=${WSG84_PROJECTION}` +
      `&bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}` +
      '&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region'
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/ /g, '%20'))
      .then(response => {
        if (response.status === HttpStatusCode.OK) {
          return response.json().then(response => {
            return response
          }).catch(error => {
            console.error(error)
            throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
          })
        } else {
          response.text().then(response => {
            console.error(response)
          })
          throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
        }
      }).catch(error => {
        console.error(error)
        throw REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE
      })
  } catch (error) {
    console.error(error)
    return Promise.reject(REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE)
  }
}

function getFirstFeature (response) {
  // There must be only one feature per regulation
  const FIRST_FEATURE = 0

  if (response.features.length === 1 && response.features[FIRST_FEATURE]) {
    return response.features[FIRST_FEATURE]
  } else {
    throw Error('We found multiple features for this zone')
  }
}

/**
 * @description This API isn't authenticated
 */
function getRegulatoryFeatureMetadataFromAPI (regulatorySubZone, fromBackoffice) {
  let url
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    url = getRegulatoryZoneURL(LayerProperties.REGULATORY.code, regulatorySubZone, geoserverURL)
  } catch (e) {
    return Promise.reject(e)
  }

  return fetch(url)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json().then(response => {
          return getFirstFeature(response)
        })
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
    })
}

/**
 * @description This API isn't authenticated
 */
function getAdministrativeSubZonesFromAPI (type, fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  let query
  if (type === LayerProperties.FAO.code) {
    const filter = 'f_level=\'DIVISION\''

    query = `${geoserverURL}/geoserver/wfs?service=WFS&` +
      `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
      `outputFormat=application/json&srsname=${WSG84_PROJECTION}&CQL_FILTER=` +
      filter.replace(/'/g, '%27').replace(/ /g, '%20')
  } else {
    query = `${geoserverURL}/geoserver/wfs?service=WFS&` +
      `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
      `outputFormat=application/json&srsname=${WSG84_PROJECTION}`
  }

  return fetch(query)
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json().then(response => {
          return response
        }).catch(e => {
          throwIrretrievableAdministrativeZoneError(e, type)
        })
      } else {
        response.text().then(response => {
          throwIrretrievableAdministrativeZoneError(response, type)
        })
      }
    }).catch(e => {
      if (process.env.NODE_ENV === 'development') {
        return {
          features: []
        }
      }

      throwIrretrievableAdministrativeZoneError(e, type)
    })
}

/**
 * @description This API isn't authenticated
 */
function sendRegulationTransaction (feature, actionType) {
  const formatWFS = new WFS()
  const formatGML = new GML({
    featureNS: 'monitorfish',
    featureType: 'monitorfish:regulations_write',
    srsName: 'EPSG:4326'
  })

  const xs = new XMLSerializer()
  let transaction
  if (actionType === REGULATION_ACTION_TYPE.UPDATE) {
    transaction = formatWFS.writeTransaction(null, [feature], null, formatGML)
  } else if (actionType === REGULATION_ACTION_TYPE.INSERT) {
    transaction = formatWFS.writeTransaction([feature], null, null, formatGML)
  } else if (actionType === REGULATION_ACTION_TYPE.DELETE) {
    transaction = formatWFS.writeTransaction(null, null, [feature], formatGML)
  }
  const payload = xs.serializeToString(transaction)

  return fetch(`${GEOSERVER_BACKOFFICE_URL}/geoserver/wfs`, {
    method: 'POST',
    mode: 'no-cors',
    dataType: 'xml',
    processData: false,
    contentType: 'text/xml',
    body: payload.replace('feature:', '')
  })
    .then(r => {
      return r
    })
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
