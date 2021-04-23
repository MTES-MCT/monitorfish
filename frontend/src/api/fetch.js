import Layers from "../domain/entities/layers"
import {OPENLAYERS_PROJECTION, WSG84_PROJECTION} from "../domain/entities/map";

const OK = 200
const NOT_FOUND = 404
const ACCEPTED = 202

const LAST_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les dernières positions"
const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"
const ERS_ERROR_MESSAGE = "Nous n'avons pas pu chercher les messages JPE de ce navire"
const CONTROLS_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les contrôles pour ce navire"
const VESSEL_SEARCH_ERROR_MESSAGE = "Nous n'avons pas pu chercher les navires dans notre base"
const REGULATORY_ZONES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les zones réglementaires"
const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la couche réglementaire"
const GEAR_CODES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les codes des engins de pêches"
const FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les segments de flotte"

function throwIrretrievableAdministrativeZoneError(e, type) {
    throw Error(`Nous n'avons pas pu récupérer la zone ${type} : ${e}`)
}

function getIrretrievableRegulatoryZoneError(e, regulatoryZone) {
    return Error(`Nous n'avons pas pu récupérer la zone réglementaire ${regulatoryZone.layerName}/${regulatoryZone.zone} : ${e}`)
}

export function getVesselsLastPositionsFromAPI() {
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

export function getVesselFromAPI(
  internalReferenceNumber,
  externalReferenceNumber,
  IRCS,
  vesselTrackDepthObject) {
    internalReferenceNumber = internalReferenceNumber ? internalReferenceNumber : ""
    externalReferenceNumber = externalReferenceNumber ? externalReferenceNumber : ""
    IRCS = IRCS ? IRCS : ""
    let trackDepth = vesselTrackDepthObject.trackDepth ? vesselTrackDepthObject.trackDepth : ""
    let afterDateTime = vesselTrackDepthObject.afterDateTime ? vesselTrackDepthObject.afterDateTime.toISOString() : ""
    let beforeDateTime = vesselTrackDepthObject.beforeDateTime ? vesselTrackDepthObject.beforeDateTime.toISOString() : ""

    return fetch(`/bff/v1/vessels/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${IRCS}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`)
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

export function searchVesselsFromAPI(searched) {
    searched = searched ? searched : ""

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

export function getAllRegulatoryZonesFromAPI() {
    return fetch(`${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
        `${Layers.REGULATORY.code}&outputFormat=application/json&propertyName=layer_name,engins,engins_interdits,especes,especes_interdites,references_reglementaires,zones,facade,region`)
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

export function getAdministrativeZoneFromAPI(administrativeZone, extent, subZone) {
    return fetch(getAdministrativeZoneURL(administrativeZone, extent, subZone))
        .then(response => {
            if (response.status === OK) {
                return response.json().then(response => {
                    return response
                }).catch(e => {
                    throwIrretrievableAdministrativeZoneError(e, administrativeZone);
                })
            } else {
                response.text().then(response => {
                    throwIrretrievableAdministrativeZoneError(response, administrativeZone);
                })
            }
        }).catch(e => {
            throwIrretrievableAdministrativeZoneError(e, administrativeZone);
        })
}

export function getAdministrativeZoneURL(type, extent, subZone) {
    let extentFilter = ''
    if(extent) {
        extentFilter = `&bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}`
    }

    let subZoneFilter = ''
    if(subZone) {
        let filter = `${subZone.replace(/'/g, '\'\'')}`;

        subZoneFilter = `&featureID=` + filter
            .replace(/'/g, '%27')
            .replace(/ /g, '%20')
    }

    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
        `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
        `outputFormat=application/json&srsname=${WSG84_PROJECTION}` + extentFilter + subZoneFilter
    );
}

export function getRegulatoryZoneFromAPI(type, regulatoryZone) {
    try {
        return fetch(getRegulatoryZoneURL(type, regulatoryZone))
            .then(response => {
                if (response.status === OK) {
                    return response.json().then(response => {
                        return response
                    }).catch(e => {
                        throw getIrretrievableRegulatoryZoneError(e, regulatoryZone);
                    })
                } else {
                    response.text().then(response => {
                        throw getIrretrievableRegulatoryZoneError(response, regulatoryZone);
                    })
                }
            }).catch(e => {
                throw getIrretrievableRegulatoryZoneError(e, regulatoryZone);
            })
    } catch (e) {
        return Promise.reject(getIrretrievableRegulatoryZoneError(e, regulatoryZone))
    }
}

export function getRegulatoryZoneURL(type, regulatoryZone) {
    if (!regulatoryZone.layerName) {
        throw new Error('Le nom de la couche n\'est pas renseigné')
    }
    if (!regulatoryZone.zone) {
        throw new Error('Le nom de la zone n\'est pas renseigné')
    }

    let filter = `layer_name='${regulatoryZone.layerName.replace(/'/g, '\'\'')}' AND zones='${regulatoryZone.zone.replace(/'/g, '\'\'')}'`;
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS` +
        `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
        `&outputFormat=application/json&CQL_FILTER=` +
        filter.replace(/'/g, '%27').replace(/ /g, '%20')
    )
}

export function getRegulatoryZoneMetadataFromAPI(regulatorySubZone) {

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
                        throw Error("We found multiple layers for this layer")
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

export function getAllGearCodesFromAPI() {
    return fetch(`/bff/v1/gears`)
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

export function getVesselERSMessagesFromAPI(vesselIdentity) {
    let internalReferenceNumber = vesselIdentity.internalReferenceNumber ? vesselIdentity.internalReferenceNumber : ""
    let externalReferenceNumber = vesselIdentity.externalReferenceNumber ? vesselIdentity.externalReferenceNumber : ""
    let ircs = vesselIdentity.ircs ? vesselIdentity.ircs : ""

    return fetch(`/bff/v1/ers/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}`)
            .then(response => {
                if (response.status === OK) {
                    return response.json()
                } else if(response.status === NOT_FOUND) {
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

export function getVesselControlsFromAPI(vesselId, fromDate) {
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

export function getAdministrativeSubZonesFromAPI(type) {
    let query
    if(type === Layers.FAO.code) {
        let filter = `f_level='DIVISION'`

        query = `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
            `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
            `outputFormat=application/json&srsname=${WSG84_PROJECTION}&CQL_FILTER=` +
            filter.replace(/'/g, '%27').replace(/ /g, '%20')
    } else {
        query = `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
            `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
            `outputFormat=application/json&srsname=${WSG84_PROJECTION}`;
    }

    return fetch(query)
        .then(response => {
            if (response.status === OK) {
                return response.json().then(response => {
                    return response
                }).catch(e => {
                    throwIrretrievableAdministrativeZoneError(e, type);
                })
            } else {
                response.text().then(response => {
                    throwIrretrievableAdministrativeZoneError(response, type);
                })
            }
        }).catch(e => {
            throwIrretrievableAdministrativeZoneError(e, type);
        })
}

export function getAllFleetSegmentFromAPI() {
    return fetch(`/bff/v1/fleet_segments`)
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
