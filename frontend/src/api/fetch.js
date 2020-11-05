import Layers from "../domain/enum"

export function getShips(setShips, dispatch) {
    fetch('/bff/v1/positions')
        .then(response => response.json())
        .then(ships => {
            setShips(ships)
        })
        .catch(error => {
            dispatch({type: 'SET_ERROR', payload: error});
        });
}

export function getShipTrack(setShipTrack, dispatch, shipTrackInternalReferenceNumberToShow) {
    fetch(`/bff/v1/positions/${shipTrackInternalReferenceNumberToShow}`)
        .then(response => response.json())
        .then(shipTrack => {
            setShipTrack(shipTrack)
        })
        .catch(error => {
            console.log(error)
            dispatch({type: 'SET_ERROR', payload: error});
        });
}

export function getAllRegulatoryLayerNames(dispatch) {
    return fetch(`${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
                `${Layers.REGULATORY}&outputFormat=application/json&propertyName=layer_name`)
        .then(response => response.json())
        .then(features => {
            const layerNames = features.features.map(feature => {
                return feature.properties.layer_name
            })
            const uniqueLayerNames = new Set(layerNames)

            return [...uniqueLayerNames]
        })
        .catch(error => {
            console.log(error)
            dispatch({type: 'SET_ERROR', payload: error});
        });
}