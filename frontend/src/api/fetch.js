/* eslint-disable */
/** @namespace API */
const API = null // eslint-disable-line
/* eslint-disable */

import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'


const OK = 200
const NOT_FOUND = 404
const ACCEPTED = 202

const LAST_POSITIONS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les dernières positions'
const VESSEL_POSITIONS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les informations du navire'
const ERS_ERROR_MESSAGE = 'Nous n\'avons pas pu chercher les messages JPE de ce navire'
const CONTROLS_ERROR_MESSAGE = 'Nous n\'avons pas pu récuperer les contrôles pour ce navire'
const VESSEL_SEARCH_ERROR_MESSAGE = 'Nous n\'avons pas pu chercher les navires dans notre base'
const REGULATORY_ZONES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les zones réglementaires'
const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer la couche réglementaire'
const GEAR_CODES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les codes des engins de pêches'
const FLEET_SEGMENT_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les segments de flotte'
const HEALTH_CHECK_ERROR_MESSAGE = 'Nous n\'avons pas pu vérifier si l\'application est à jour'
const GEOMETRY_ERROR_MEESAGE = 'Nous n\'avons pas pu récupérer la liste des tracés'

function throwIrretrievableAdministrativeZoneError (e, type) {
  throw Error(`Nous n'avons pas pu récupérer la zone ${type} : ${e}`)
}

function getIrretrievableRegulatoryZoneError (e, regulatoryZone) {
  return Error(`Nous n'avons pas pu récupérer la zone réglementaire ${regulatoryZone.layerName}/${regulatoryZone.zone} : ${e}`)
}

/**
 * Get all vessels last positions
 * @memberOf API
 * @returns {Promise<VesselLastPosition>} The vessels
 * @throws {Error}
 */
function getVesselsLastPositionsFromAPI () {
  return fetch('/bff/v1/vessels')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(LAST_POSITIONS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(LAST_POSITIONS_ERROR_MESSAGE)
    })
    .then(vessels => {
      return vessels
    })
}

/**
 * Get vessel information and last positions
 * @memberOf API
 * @returns {Promise<Vessel>} The vessels
 * @throws {Error}
 */
function getVesselFromAPI (identity, vesselTrackDepthObject) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || 'UNDEFINED'
  const trackDepth = vesselTrackDepthObject.trackDepth ? vesselTrackDepthObject.trackDepth : ''
  const afterDateTime = vesselTrackDepthObject.afterDateTime ? vesselTrackDepthObject.afterDateTime.toISOString() : ''
  const beforeDateTime = vesselTrackDepthObject.beforeDateTime ? vesselTrackDepthObject.beforeDateTime.toISOString() : ''

  return fetch(`/bff/v1/vessels/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`)
    .then(response => {
      if (response.status === OK) {
        return response.json().then(vessel => {
          return {
            vessel: vessel,
            trackDepthHasBeenModified: false
          }
        })
      } else if (response.status === ACCEPTED) {
        return response.json().then(vessel => {
          return {
            vessel: vessel,
            trackDepthHasBeenModified: true
          }
        })
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
    })
    .then(vessel => vessel)
}

function searchVesselsFromAPI (searched) {
  searched = searched || ''

  return fetch(`/bff/v1/vessels/search?searched=${searched}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(VESSEL_SEARCH_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(VESSEL_SEARCH_ERROR_MESSAGE)
    })
}

function getAllRegulatoryLayersFromAPI () {
  return fetch(`${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
    `${Layers.REGULATORY.code}&outputFormat=application/json&propertyName=law_type,layer_name,engins,engins_interdits,especes,especes_interdites,references_reglementaires,zones,facade,region`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
    })
}

/**
 * Get geometry object of regulatory area without regulation reference
 * @memberOf API
 * @returns {Promise<GeoJSON>} The geometry as GeoJSON feature
 * @throws {Error}
 */
function getAllGeometryWithoutProperty () {
  const filter = 'references_reglementaires IS NULL AND zones IS NULL AND region IS NULL AND facade IS NULL AND law_type IS NULL AND layer_name IS NULL'
  const REQUEST = `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
  `${Layers.REGULATORY.code}&outputFormat=application/json&propertyName=geometry&CQL_FILTER=` + filter.replace(/'/g, '%27').replace(/ /g, '%20')
  return fetch(REQUEST)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(GEOMETRY_ERROR_MEESAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(GEOMETRY_ERROR_MEESAGE)
    })
}

/**
 * Get the administrative zone GeoJSON feature
 * @memberOf API
 * @param {string} administrativeZone
 * @param {string[]|null} extent
 * @param {string|null} subZone
 * @returns {Promise<GeoJSON>} The feature GeoJSON
 * @throws {Error}
 */
function getAdministrativeZoneFromAPI (administrativeZone, extent, subZone) {
  return fetch(getAdministrativeZoneURL(administrativeZone, extent, subZone))
    .then(response => {
      if (response.status === OK) {
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
 * @memberOf API
 * @param {string} type
 * @param {string[]|null} extent
 * @param {string|null} subZone
 * @returns {string} - the zone URL WFS request
 */
function getAdministrativeZoneURL (type, extent, subZone) {
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
    `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
    `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
    `outputFormat=application/json&srsname=${WSG84_PROJECTION}` + extentFilter + subZoneFilter
  )
}

function getRegulatoryZoneFromAPI (type, regulatoryZone) {
  try {
    return fetch(getRegulatoryZoneURL(type, regulatoryZone))
      .then(response => {
        if (response.status === OK) {
          return response.json().then(response => {
            return response
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

function getRegulatoryZoneURL (type, regulatoryZone) {
  if (!regulatoryZone.layerName) {
    throw new Error('Le nom de la couche n\'est pas renseigné')
  }
  if (!regulatoryZone.zone) {
    throw new Error('Le nom de la zone n\'est pas renseigné')
  }

  const filter = `layer_name='${regulatoryZone.layerName.replace(/'/g, '\'\'')}' AND zones='${regulatoryZone.zone.replace(/'/g, '\'\'')}'`
  return (
    `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS` +
    `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
    '&outputFormat=application/json&CQL_FILTER=' +
    filter.replace(/'/g, '%27').replace(/ /g, '%20')
  )
}

function getRegulatoryZoneMetadataFromAPI (regulatorySubZone) {
  let url
  try {
    url = getRegulatoryZoneURL(Layers.REGULATORY.code, regulatorySubZone)
  } catch (e) {
    return Promise.reject(e)
  }

  return fetch(url)
    .then(response => {
      if (response.status === OK) {
        return response.json().then(response => {
          if (response.features.length === 1 && response.features[0]) {
            return response.features[0].properties
          } else {
            throw Error('We found multiple layers for this layer')
          }
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

function getAllGearCodesFromAPI () {
  return fetch('/bff/v1/gears')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(GEAR_CODES_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(GEAR_CODES_ERROR_MESSAGE)
    })
}

function getVesselVoyageFromAPI (vesselIdentity, beforeDateTime) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber ? vesselIdentity.internalReferenceNumber : ''
  const externalReferenceNumber = vesselIdentity.externalReferenceNumber ? vesselIdentity.externalReferenceNumber : ''
  const ircs = vesselIdentity.ircs ? vesselIdentity.ircs : ''
  beforeDateTime = beforeDateTime ? new Date(beforeDateTime).toISOString() : ''

  return fetch(`/bff/v1/ers/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&beforeDateTime=${beforeDateTime}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else if (response.status === NOT_FOUND) {
        response.text().then(text => {
          console.info(text)
        })
        return null
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(ERS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(ERS_ERROR_MESSAGE)
    })
    .then(ers => ers)
}

/**
 * Get vessel controls
 * @memberOf API
 * @returns {Promise<ControlResume>} The vessels
 * @throws {Error}
 */
function getVesselControlsFromAPI (vesselId, fromDate) {
  return fetch(`/bff/v1/vessels/${vesselId}/controls?afterDateTime=${fromDate.toISOString()}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(CONTROLS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(CONTROLS_ERROR_MESSAGE)
    })
    .then(controls => controls)
}

function getAdministrativeSubZonesFromAPI (type) {
  let query
  if (type === Layers.FAO.code) {
    const filter = 'f_level=\'DIVISION\''

    query = `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
      `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
      `outputFormat=application/json&srsname=${WSG84_PROJECTION}&CQL_FILTER=` +
      filter.replace(/'/g, '%27').replace(/ /g, '%20')
  } else {
    query = `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
      `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
      `outputFormat=application/json&srsname=${WSG84_PROJECTION}`
  }

  return fetch(query)
    .then(response => {
      if (response.status === OK) {
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
      throwIrretrievableAdministrativeZoneError(e, type)
    })
}

function getAllFleetSegmentFromAPI () {
  return fetch('/bff/v1/fleet_segments')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(FLEET_SEGMENT_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(FLEET_SEGMENT_ERROR_MESSAGE)
    })
}

/**
 * Get application healthcheck
 * @memberOf API
 * @returns {Promise<Healthcheck>} The healthcheck dates of positions and ers messages
 * @throws {Error}
 */
function getHealthcheckFromAPI () {
  return fetch('/bff/v1/healthcheck')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(HEALTH_CHECK_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(HEALTH_CHECK_ERROR_MESSAGE)
    })
}

export {
  getVesselsLastPositionsFromAPI,
  getVesselFromAPI,
  searchVesselsFromAPI,
  getAllRegulatoryLayersFromAPI,
  getAdministrativeZoneFromAPI,
  getAdministrativeZoneURL,
  getRegulatoryZoneFromAPI,
  getRegulatoryZoneURL,
  getRegulatoryZoneMetadataFromAPI,
  getAllGearCodesFromAPI,
  getVesselVoyageFromAPI,
  getVesselControlsFromAPI,
  getAdministrativeSubZonesFromAPI,
  getAllFleetSegmentFromAPI,
  getHealthcheckFromAPI,
  getAllGeometryWithoutProperty
}
