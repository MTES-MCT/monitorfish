import {useContext, useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {Style} from 'ol/style';
import {Context} from "../Store";

import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import GeoJSON from "ol/format/GeoJSON";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";
import Layers from "../domain/layers";
import Fill from "ol/style/Fill";
import LayersEnum from "../domain/layers";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";

const FAOLayer = () => {
    const [state, dispatch] = useContext(Context)

    const vectorSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: BACKEND_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        url: (extent) => {
            return (
                process.env.REACT_APP_GEOSERVER_LOCAL_URL + '/geoserver/wfs?service=WFS&' +
                'version=1.1.0&request=GetFeature&typename=monitorfish:'+ LayersEnum.FAO +'&' +
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
        className: Layers.FAO,
        style: (feature, _) => {
            return new Style({
                stroke: new Stroke({
                    color: '#767AB2',
                    width: 1,
                }),
                text: new Text({
                    font: '12px Avenir',
                    text: `${feature.get('f_division') ? feature.get('f_division') : ''}`,
                    fill: new Fill({color: '#05055E'}),
                    stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
                })
            })
        },
    });

    useEffect( () => {
        if(state.layer.layerToShow && state.layer.layerToShow.type === Layers.FAO) {
            dispatch({type: 'ADD_LAYER', payload: vector});
        }
    },[state.layer.layerToShow])

    useEffect( () => {
        if(state.layer.layerToHide && state.layer.layerToHide.type === Layers.FAO) {
            dispatch({type: 'REMOVE_LAYER', payload: vector});
        }
    },[state.layer.layerToHide])

    return null
}

export default FAOLayer
