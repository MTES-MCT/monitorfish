import Layers from "../domain/layers"
import {setError} from "../reducers/Global";

const HTTP_OK = 200

export function getVesselsLastPositionsFromAPI(dispatch) {
    return fetch('/bff/v1/vessels')
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                return response.json().then(error => {
                    throw Error(error.error)
                })
            }
        })
        .then(vessels => {
            return vessels
        })
        .catch(error => {
            dispatch(setError(error));
        });
}

export function getVesselFromAPI(dispatch, vesselTrackInternalReferenceNumberToShow) {
    return fetch(`/bff/v1/vessels/${vesselTrackInternalReferenceNumberToShow}`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                return response.json().then(error => {
                    throw Error(error.error)
                })
            }
        })
        .then(vessel => vessel)
        .catch(error => {
            dispatch(setError(error))
        });
}

export function getAllRegulatoryLayerNames(dispatch) {
    return fetch(`${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
                `${Layers.REGULATORY}&outputFormat=application/json&propertyName=layer_name`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                return response.json().then(error => {
                    throw Error(error.error)
                })
            }
        })
        .then(features => {
            const layerNames = features.features.map(feature => {
                return feature.properties.layer_name
            })
            const uniqueLayerNames = new Set(layerNames)

            return [...uniqueLayerNames]
        })
        .catch(error => {
            console.error("Récupération des couches réglementaire impossible", error)
            dispatch(setError(new Error("Récupération des couches réglementaire impossible")));
        });
}