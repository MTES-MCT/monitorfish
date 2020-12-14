import Layers from "../domain/layers"

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

export function getVesselFromAPI(vesselTrackInternalReferenceNumberToShow) {
    return fetch(`/bff/v1/vessels/${vesselTrackInternalReferenceNumberToShow}`)
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
