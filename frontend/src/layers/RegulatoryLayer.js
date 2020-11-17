import {useContext, useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {Style} from 'ol/style';
import {Context} from "../Store";

import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import GeoJSON from "ol/format/GeoJSON";
import Stroke from "ol/style/Stroke";
import Layers from "../domain/layers";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";

const RegulatoryLayer = (props) => {
    const [state, dispatch] = useContext(Context)

    const getVectorSource = layerName => {
        return new VectorSource({
            format: new GeoJSON({
                dataProjection: BACKEND_PROJECTION,
                featureProjection: OPENLAYERS_PROJECTION
            }),
            url: () => {
                return (
                    `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
                    `${Layers.REGULATORY}&outputFormat=application/json&CQL_FILTER=layer_name='${layerName}'`
                );
            },
            strategy: bboxStrategy,
        });
    }

    const getVector = layerName => {
        return new VectorLayer({
            source: getVectorSource(layerName),
            renderMode: 'image',
            className: Layers.REGULATORY + ':' + layerName,
            style: (feature, _) => {
                return new Style({
                    stroke: new Stroke({
                        color: '#05055E',
                        width: 2,
                    })
                })
            }
        });
    }

    useEffect( () => {
        if(state.layer.layerToShow && state.layer.layerToShow.type === Layers.REGULATORY && state.layer.layerToShow.filter) {
            dispatch({type: 'ADD_LAYER', payload: getVector(state.layer.layerToShow.filter)});
        }
    },[state.layer.layerToShow])

    useEffect( () => {
        if(state.layer.layerToHide && state.layer.layerToHide.type === Layers.REGULATORY && state.layer.layerToHide.filter) {
            dispatch({type: 'REMOVE_LAYER', payload: getVector(state.layer.layerToHide.filter)});
        }
    },[state.layer.layerToHide])

    return null
}

export default RegulatoryLayer
