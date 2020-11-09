import {useContext, useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {Style} from 'ol/style';
import {Context} from "../Store";

import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import GeoJSON from "ol/format/GeoJSON";
import Stroke from "ol/style/Stroke";
import Layers from "../domain/layers";
import Fill from "ol/style/Fill";
import LayersEnum from "../domain/layers";
import Text from "ol/style/Text";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";

const SixMilesLayer = () => {
    const [state, dispatch] = useContext(Context)

    const vectorSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: BACKEND_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        url: (extent) => {
            return (
                process.env.REACT_APP_GEOSERVER_LOCAL_URL + '/geoserver/wfs?service=WFS&' +
                'version=1.1.0&request=GetFeature&typename=monitorfish:'+ LayersEnum.SIX_MILES +'&' +
                'outputFormat=application/json&srsname='+ BACKEND_PROJECTION +'&' +
                'bbox=' +
                extent.join(',') +
                ',' + OPENLAYERS_PROJECTION
            );
        },
        strategy: bboxStrategy,
    });

    const vector = new VectorLayer({
        source: vectorSource,
        renderMode: 'image',
        className: Layers.SIX_MILES,
        style: (feature, _) => {
            return new Style({
                stroke: new Stroke({
                    color: '#05055E',
                    width: 3,
                })
            })
        }
    });

    useEffect( () => {
        if(state.layer.layerToShow && state.layer.layerToShow.type === Layers.SIX_MILES) {
            dispatch({type: 'ADD_LAYER', payload: vector});
        }
    },[state.layer.layerToShow])

    useEffect( () => {
        if(state.layer.layerToHide && state.layer.layerToHide.type === Layers.SIX_MILES) {
            dispatch({type: 'REMOVE_LAYER', payload: vector});
        }
    },[state.layer.layerToHide])

    return null
}

export default SixMilesLayer
