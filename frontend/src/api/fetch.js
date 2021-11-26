/* eslint-disable */
/** @namespace API */
const API = null // eslint-disable-line
/* eslint-disable */

import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import { REGULATION_ACTION_TYPE } from '../domain/entities/regulatory'
import WFS from 'ol/format/WFS'
import GML from 'ol/format/GML'

const OK = 200
const NOT_FOUND = 404
const ACCEPTED = 202

const LAST_POSITIONS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les dernières positions'
const VESSEL_POSITIONS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les informations du navire'
const ERS_ERROR_MESSAGE = 'Nous n\'avons pas pu chercher les messages JPE de ce navire'
const CONTROLS_ERROR_MESSAGE = 'Nous n\'avons pas pu récuperer les contrôles pour ce navire'
const VESSEL_SEARCH_ERROR_MESSAGE = 'Nous n\'avons pas pu chercher les navires dans notre base'
const REGULATORY_ZONES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les zones réglementaires'
const REGULATORY_ZONES_ZONE_SELECTION_ERROR_MESSAGE = 'Nous n\'avons pas pu filtrer les zones réglementaires par zone'
export const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer la couche réglementaire'
const GEAR_CODES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les codes des engins de pêches'
const SPECIES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les espèces'
const FLEET_SEGMENT_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les segments de flotte'
const HEALTH_CHECK_ERROR_MESSAGE = 'Nous n\'avons pas pu vérifier si l\'application est à jour'
const GEOMETRY_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer la liste des tracés'
const UPDATE_REGULATION_MESSAGE = 'Une erreur est survenue lors de la mise à jour de la zone réglementaire dans GeoServer'
const CONTROL_OBJECTIVES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les objectifs de contrôle'
const UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE = 'Nous n\'avons pas pu mettre à jour l\'objectifs de contrôle'
const ALERTS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les alertes opérationelles'

function throwIrretrievableAdministrativeZoneError (e, type) {
  throw Error(`Nous n'avons pas pu récupérer la zone ${type} : ${e}`)
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
 * Get vessel information and positions
 * @memberOf API
 * @returns {Promise<{
 *   vesselAndPositions: {
 *     vessel: Vessel,
 *     positions: VesselPosition[]
 *   },
 *   trackDepthHasBeenModified: boolean
 * }>} The vessel
 * @throws {Error}
 */
function getVesselFromAPI (identity, vesselTrackDepthObject) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || 'UNDEFINED'
  const trackDepth = vesselTrackDepthObject.trackDepth || ''
  const afterDateTime = vesselTrackDepthObject.afterDateTime?.toISOString() || ''
  const beforeDateTime = vesselTrackDepthObject.beforeDateTime?.toISOString() || ''

  return fetch(`/bff/v1/vessels/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`)
    .then(response => {
      if (response.status === OK || response.status === ACCEPTED) {
        return response.json().then(vesselAndPositions => {
          return {
            vesselAndPositions: vesselAndPositions,
            trackDepthHasBeenModified: response.status === ACCEPTED
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

/**
 * Get vessel positions
 * @memberOf API
 * @returns {Promise<{
 *   positions: VesselPosition[],
 *   trackDepthHasBeenModified: boolean
 * }>} The positions
 * @throws {Error}
 */
function getVesselPositionsFromAPI (identity, vesselTrackDepthObject) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || 'UNDEFINED'
  const trackDepth = vesselTrackDepthObject.trackDepth || ''
  const afterDateTime = vesselTrackDepthObject.afterDateTime?.toISOString() || ''
  const beforeDateTime = vesselTrackDepthObject.beforeDateTime?.toISOString() || ''

  return fetch(`/bff/v1/vessels/positions?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`)
    .then(response => {
      if (response.status === OK || response.status === ACCEPTED) {
        return response.json().then(positions => {
          return {
            positions: positions,
            trackDepthHasBeenModified: response.status === ACCEPTED
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
    .then(positions => positions)
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

function getAllRegulatoryLayersFromAPI (fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  return fetch(`${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
    `${Layers.REGULATORY.code}&outputFormat=application/json&propertyName=id,law_type,layer_name,engins,engins_interdits,especes,especes_interdites,references_reglementaires,zones,region`)
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
 * @param {boolean} fromBackoffice - From backoffice
 * @returns {Promise<GeoJSON>} The geometry as GeoJSON feature
 * @throws {Error}
 */
function getAllGeometryWithoutProperty (fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  const filter = 'references_reglementaires IS NULL AND zones IS NULL AND region IS NULL AND law_type IS NULL AND layer_name IS NULL'
  const REQUEST = `${geoserverURL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
  `${Layers.REGULATORY.code}&outputFormat=application/json&propertyName=geometry,id&CQL_FILTER=` + filter.replace(/'/g, '%27').replace(/ /g, '%20')
  return fetch(REQUEST)
    .then(response => {
      if (response.status === OK) {
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
 * @memberOf API
 * @param {string} administrativeZone
 * @param {string[]|null} extent
 * @param {string|null} subZone
 * @param {boolean} fromBackoffice - From backoffice
 * @returns {Promise<GeoJSON>} The feature GeoJSON
 * @throws {Error}
 */
function getAdministrativeZoneFromAPI (administrativeZone, extent, subZone, fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  return fetch(getAdministrativeZoneURL(administrativeZone, extent, subZone, geoserverURL))
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

function getRegulatoryZoneFromAPI (type, regulatoryZone, fromBackoffice) {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return fetch(getRegulatoryZoneURL(type, regulatoryZone, geoserverURL))
      .then(response => {
        if (response.status === OK) {
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

function getRegulatoryZoneURL (type, regulatoryZone, geoserverURL) {
  if (!regulatoryZone.topic) {
    throw new Error('Le nom de la couche n\'est pas renseigné')
  }
  if (!regulatoryZone.zone) {
    throw new Error('Le nom de la zone n\'est pas renseigné')
  }

  const filter = `layer_name='${encodeURIComponent(regulatoryZone.topic).replace(/'/g, '\'\'')}' AND zones='${encodeURIComponent(regulatoryZone.zone).replace(/'/g, '\'\'')}'`
  return (
    `${geoserverURL}/geoserver/wfs?service=WFS` +
    `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
    '&outputFormat=application/json&CQL_FILTER=' +
    filter.replace(/'/g, '%27').replace(/ /g, '%20')
  )
}

/**
 * Get the regulatory zones GeoJSON feature filtered with the OpenLayers extent (the BBOX)
 * @memberOf API
 * @param {string[]|null} extent
 * @param {boolean} fromBackoffice
 * @returns {Promise<GeoJSON>} The feature GeoJSON
 * @throws {Error}
 */
export function getRegulatoryZonesInExtentFromAPI (extent, fromBackoffice) {
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    return fetch(`${geoserverURL}/geoserver/wfs?service=WFS` +
      `&version=1.1.0&request=GetFeature&typename=monitorfish:${Layers.REGULATORY.code}` +
      `&outputFormat=application/json&srsname=${WSG84_PROJECTION}` +
      `&bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}` +
      `&propertyName=law_type,layer_name,engins,engins_interdits,especes,especes_interdites,references_reglementaires,zones,facade,region`
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/ /g, '%20'))
      .then(response => {
        if (response.status === OK) {
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

function getRegulatoryFeatureMetadataFromAPI (regulatorySubZone, fromBackoffice) {
  let url
  try {
    const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

    url = getRegulatoryZoneURL(Layers.REGULATORY.code, regulatorySubZone, geoserverURL)
  } catch (e) {
    return Promise.reject(e)
  }

  return fetch(url)
    .then(response => {
      if (response.status === OK) {
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

/**
 * Get species
 * @memberOf API
 * @returns {Promise<SpeciesAndSpeciesGroups>}
 * @throws {Error}
 */
function getAllSpeciesFromAPI () {
  return fetch('/bff/v1/species')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(SPECIES_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(SPECIES_ERROR_MESSAGE)
    })
}

/**
 * Get vessel voyage
 * @memberOf API
 * @returns {Promise<VesselVoyage>} The voyage
 * @throws {Error}
 */
function getVesselVoyageFromAPI (vesselIdentity, voyageRequest, tripNumber) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber || ''
  const externalReferenceNumber = vesselIdentity.externalReferenceNumber || ''
  const ircs = vesselIdentity.ircs || ''
  tripNumber = tripNumber || ''
  voyageRequest = voyageRequest || ''

  return fetch(`/bff/v1/ers/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&voyageRequest=${voyageRequest}&tripNumber=${tripNumber}`)
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

function getAdministrativeSubZonesFromAPI (type, fromBackoffice) {
  const geoserverURL = fromBackoffice ? GEOSERVER_BACKOFFICE_URL : GEOSERVER_URL

  let query
  if (type === Layers.FAO.code) {
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
 * Get operational alerts
 * @memberOf API
 * @returns {Promise<Alert[]>} The alerts
 * @throws {Error}
 */
function getOperationalAlertsFromAPI () {
  return fetch('/bff/v1/alerts')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(ALERTS_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(ALERTS_ERROR_MESSAGE)
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

/**
 * Get control Objectives
 * @memberOf API
 * @returns {Promise<ControlObjective[]>} The control objectives
 * @throws {Error}
 */
function getControlObjectivesFromAPI () {
  return fetch('/bff/v1/control_objectives')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(CONTROL_OBJECTIVES_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
}

/**
 * Update a control Objective
 * @memberOf API
 * @param {string} id - The id of the control objective
 * @param {UpdateControlObjective} updatedFields - The fields to update
 * @returns {Promise} The control objectives
 * @throws {Error}
 */
function updateControlObjectiveFromAPI (id, updatedFields) {
  return fetch(`/bff/v1/control_objectives/${id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(updatedFields)
  }).then(response => {
    if (response.status !== OK) {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
  })
}

function sendRegulationTransaction (feature, actionType) {
  const formatWFS = new WFS()
  const formatGML = new GML({
    featureNS: 'monitorfish',
    featureType: 'monitorfish:regulatory_areas_write',
    srsName: 'EPSG:4326'
  })

  const xs = new XMLSerializer()
  let transaction
  if (actionType === REGULATION_ACTION_TYPE.UPDATE) {
    transaction  = formatWFS.writeTransaction(null, [feature], null, formatGML)
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
  getVesselsLastPositionsFromAPI,
  getVesselFromAPI,
  getVesselPositionsFromAPI,
  searchVesselsFromAPI,
  getAllRegulatoryLayersFromAPI,
  getAdministrativeZoneFromAPI,
  getAdministrativeZoneURL,
  getRegulatoryZoneFromAPI,
  getRegulatoryZoneURL,
  getRegulatoryFeatureMetadataFromAPI,
  getAllGearCodesFromAPI,
  getVesselVoyageFromAPI,
  getVesselControlsFromAPI,
  getAdministrativeSubZonesFromAPI,
  getAllFleetSegmentFromAPI,
  getHealthcheckFromAPI,
  getAllGeometryWithoutProperty,
  sendRegulationTransaction,
  getControlObjectivesFromAPI,
  updateControlObjectiveFromAPI,
  getAllSpeciesFromAPI,
  getOperationalAlertsFromAPI
}
