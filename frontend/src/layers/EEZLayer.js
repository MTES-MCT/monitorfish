import React, {useContext, useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {Style} from 'ol/style';
import {Context} from "../state/Store";

import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import GeoJSON from "ol/format/GeoJSON";
import Stroke from "ol/style/Stroke";
import Layers from "./LayersEnum";
import Fill from "ol/style/Fill";
import LayersEnum from "./LayersEnum";

const EEZLayer = () => {
    const [state, dispatch] = useContext(Context)

    const vectorSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        }),
        url: (extent) => {
            // I had to reproject to 4326 from 32631 (declared nativeSRS from Geoserver) and force declared
            return (
                'http://localhost:8081/geoserver/wfs?service=WFS&' +
                'version=1.1.0&request=GetFeature&typename=monitorfish:'+ LayersEnum.EEZ +'&' +
                'outputFormat=application/json&srsname=EPSG:4326&' +
                'bbox=' +
                extent.join(',') +
                ',EPSG:3857'
            );
        },
        strategy: bboxStrategy,
    });

    const vector = new VectorLayer({
        source: vectorSource,
        renderMode: 'image',
        className: Layers.EEZ,
        style: new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.5)',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.3)',
            })
        }),
    });

    useEffect( () => {
        if(state.layerToShow === Layers.EEZ) {
            dispatch({type: 'ADD_LAYER', payload: vector});
        }
    },[state.layerToShow])

    useEffect( () => {
        if(state.layerToHide === Layers.EEZ) {
            dispatch({type: 'REMOVE_LAYER', payload: vector});
        }
    },[state.layerToHide])

    return null
}

export default EEZLayer
