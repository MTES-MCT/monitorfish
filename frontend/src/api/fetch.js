import Layers from "../domain/entities/layers"
import {setError} from "../domain/reducers/Global";
import {OPENLAYERS_PROJECTION, WSG84_PROJECTION} from "../domain/entities/map";

const HTTP_OK = 200

export function getVesselsLastPositionsFromAPI() {
    return fetch('/bff/v1/vessels')
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error("Récupération des dernières positions impossible")
            }
        })
        .then(vessels => {
            return vessels
        })
}

export function getVesselFromAPI(internalReferenceNumber, externalReferenceNumber, IRCS) {
    internalReferenceNumber = internalReferenceNumber ? internalReferenceNumber : ""
    externalReferenceNumber = externalReferenceNumber ? externalReferenceNumber : ""
    IRCS = IRCS ? IRCS : ""

    return fetch(`/bff/v1/vessels/search?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${IRCS}`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error("Récupération des positions navire impossible")
            }
        })
        .then(vessel => vessel)
}

export function getAllRegulatoryZonesFromAPI() {
    return fetch(`${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
                `${Layers.REGULATORY}&outputFormat=application/json&propertyName=layer_name,engins,especes,references_reglementaires,zones`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error("Récupération des couches réglementaire impossible")
            }
        })
}

export function getAdministrativeZoneURL(type, extent) {
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
        `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
        `outputFormat=application/json&srsname=${WSG84_PROJECTION}&` +
        `bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}`
    );
}

export function getRegulatoryZoneURL(type, regulatoryZone) {
    if(!regulatoryZone.layerName || !regulatoryZone.zone) {
        throw new Error("Récupération de la couche réglementaire impossible")
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
        url = getRegulatoryZoneURL(Layers.REGULATORY, regulatorySubZone)
    } catch (e) {
        return Promise.reject(e)
    }

    return fetch(url)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json().then(response => {
                    if(response.features.length === 1) {
                        return response.features[0].properties
                    } else {
                        throw Error("Récupération de la couche réglementaire impossible")
                    }
                })
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error("Récupération de la couche réglementaire impossible")
            }
        })
}

export function getAllGearCodesFromAPI() {
    return fetch(`/bff/v1/gears`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error("Récupération des codes engins de pêches impossible")
            }
        })
}
