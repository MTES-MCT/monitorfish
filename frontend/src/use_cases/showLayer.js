import Layers from "../domain/layers";
import VectorLayer from "ol/layer/Vector";
import {addLayer, addShowedLayer} from "../reducers/Layer";
import {getVectorLayerStyle} from "../layers/styles/vectorLayerStyles";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {bbox as bboxStrategy} from "ol/loadingstrategy";

const showLayer = layerToShow => (dispatch, getState) => {
    console.log(layerToShow)
    if(layerToShow && layerToShow.type){
        switch (layerToShow.type) {
            case Layers.EEZ: dispatch(addLayer(getVectorLayer(Layers.EEZ))); break;
            case Layers.FAO: dispatch(addLayer(getVectorLayer(Layers.FAO))); break;
            case Layers.THREE_MILES: dispatch(addLayer(getVectorLayer(Layers.THREE_MILES))); break;
            case Layers.SIX_MILES: dispatch(addLayer(getVectorLayer(Layers.SIX_MILES))); break;
            case Layers.TWELVE_MILES: dispatch(addLayer(getVectorLayer(Layers.TWELVE_MILES))); break;
            case Layers.ONE_HUNDRED_MILES: dispatch(addLayer(getVectorLayer(Layers.ONE_HUNDRED_MILES))); break;
            case Layers.REGULATORY: {
                if (!layerToShow.filter) {
                    console.error("No regulatory layer given.")
                    return
                }
                dispatch(addLayer(getVectorLayer(Layers.REGULATORY, layerToShow.filter)));
                break;
            }
        }

        dispatch(addShowedLayer(layerToShow))
    }
}

const getVectorLayer = (type, regulatoryLayerName) => new VectorLayer({
    source: getVectorSource(type, regulatoryLayerName),
    renderMode: 'image',
    className: regulatoryLayerName ? `${Layers.REGULATORY}:${regulatoryLayerName}` : type,
    style: (feature, _) => {
        return getVectorLayerStyle(type, regulatoryLayerName)(feature)
    }
});

const getVectorSource = (type, regulatoryLayerName) => {
    return new VectorSource({
        format: new GeoJSON({
            dataProjection: BACKEND_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        url: (extent) => {
            return regulatoryLayerName ? getRegulatoryZoneURL(type, regulatoryLayerName) : getAdministrativeZoneURL(type, extent);
        },
        strategy: bboxStrategy,
    });
}

function getAdministrativeZoneURL(type, extent) {
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
        `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
        `outputFormat=application/json&srsname=${BACKEND_PROJECTION}&` +
        `box=${extent.join(',')},${OPENLAYERS_PROJECTION}`
    );
}

function getRegulatoryZoneURL(type, regulatoryLayerName) {
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS` +
        `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
        `&outputFormat=application/json&CQL_FILTER=layer_name='${regulatoryLayerName}'`
    )
}

export default showLayer