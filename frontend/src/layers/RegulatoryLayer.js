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
import {useDispatch, useSelector} from "react-redux";
import {addLayer, removeLayer} from "../reducers/Layer";

const RegulatoryLayer = (props) => {
    const layer = useSelector(state => state.layer)
    const dispatch = useDispatch()

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
        if(layer.layerToShow && layer.layerToShow.type === Layers.REGULATORY && layer.layerToShow.filter) {
            dispatch(addLayer(getVector(layer.layerToShow.filter)));
        }
    },[layer.layerToShow])

    useEffect( () => {
        if(layer.layerToHide && layer.layerToHide.type === Layers.REGULATORY && layer.layerToHide.filter) {
            dispatch(removeLayer(getVector(layer.layerToHide.filter)));
        }
    },[layer.layerToHide])

    return null
}

export default RegulatoryLayer
