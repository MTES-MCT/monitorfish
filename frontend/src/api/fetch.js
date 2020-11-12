import Layers from "../domain/layers"

export function getVessels(setVessels, dispatch) {
    fetch('/bff/v1/vessels')
        .then(response => response.json())
        .then(vessels => {
            setVessels(vessels)
        })
        .catch(error => {
            dispatch({type: 'SET_ERROR', payload: error});
        });
}

export function getVesselTrack(setVesselTrack, dispatch, vesselTrackInternalReferenceNumberToShow) {
    fetch(`/bff/v1/vessels/${vesselTrackInternalReferenceNumberToShow}`)
        .then(response => response.json())
        .then(vesselTrack => {
            setVesselTrack(vesselTrack)
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