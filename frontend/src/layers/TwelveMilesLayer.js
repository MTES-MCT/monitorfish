import {useContext, useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {Style} from 'ol/style';
import {Context} from "../Store";

import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import GeoJSON from "ol/format/GeoJSON";
import Stroke from "ol/style/Stroke";
import Layers from "../domain/layers";
import LayersEnum from "../domain/layers";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {useDispatch, useSelector} from "react-redux";
import {addLayer, removeLayer} from "../reducers/Layer";

const TwelveMilesLayer = () => {
    const layer = useSelector(state => state.layer)
    const dispatch = useDispatch()

    const vectorSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: BACKEND_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        url: (extent) => {
            return (
                process.env.REACT_APP_GEOSERVER_LOCAL_URL + '/geoserver/wfs?service=WFS&' +
                'version=1.1.0&request=GetFeature&typename=monitorfish:'+ LayersEnum.TWELVE_MILES +'&' +
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
        className: Layers.TWELVE_MILES,
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
        if(layer.layerToShow && layer.layerToShow.type === Layers.TWELVE_MILES) {
            dispatch(addLayer(vector));
        }
    },[layer.layerToShow])

    useEffect( () => {
        if(layer.layerToHide && layer.layerToHide.type === Layers.TWELVE_MILES) {
            dispatch(removeLayer(vector));
        }
    },[layer.layerToHide])

    return null
}

export default TwelveMilesLayer
