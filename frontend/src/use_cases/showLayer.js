import Layers from "../domain/layers";
import VectorLayer from "ol/layer/Vector";
import {addLayer, addShowedLayer} from "../reducers/Layer";
import {getVectorLayerStyle} from "../layers/styles/vectorLayerStyles";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {bbox as bboxStrategy} from "ol/loadingstrategy";

const showLayer = layerToShow => (dispatch, getState) => {
    if(layerToShow && layerToShow.type){
        switch (layerToShow.type) {
            case Layers.EEZ: dispatch(addLayer(getVectorLayer(Layers.EEZ))); break;
            case Layers.FAO: dispatch(addLayer(getVectorLayer(Layers.FAO))); break;
            case Layers.THREE_MILES: dispatch(addLayer(getVectorLayer(Layers.THREE_MILES))); break;
            case Layers.SIX_MILES: dispatch(addLayer(getVectorLayer(Layers.SIX_MILES))); break;
            case Layers.TWELVE_MILES: dispatch(addLayer(getVectorLayer(Layers.TWELVE_MILES))); break;
            case Layers.ONE_HUNDRED_MILES: dispatch(addLayer(getVectorLayer(Layers.ONE_HUNDRED_MILES))); break;
            case Layers.REGULATORY: {
                if (!layerToShow.zone) {
                    console.error("No regulatory layer to show.")
                    return
                }
                dispatch(addLayer(getVectorLayer(Layers.REGULATORY, layerToShow.zone, getState)));
                break;
            }
        }

        dispatch(addShowedLayer(layerToShow))
    }
}

const getVectorLayer = (type, regulatoryZone, getState) => new VectorLayer({
    source: getVectorSource(type, regulatoryZone),
    renderMode: 'image',
    className: regulatoryZone ? `${Layers.REGULATORY}:${regulatoryZone.layerName}:${regulatoryZone.zone}` : type,
    style: (feature, _) => {
        if (regulatoryZone) {
            //getState().
        }
        // TODO: Fix the opacity going up...
        return [getVectorLayerStyle(type, regulatoryZone)(feature)]
    }
});

const getVectorSource = (type, regulatoryZone) => {
    return new VectorSource({
        format: new GeoJSON({
            dataProjection: WSG84_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        url: extent => {
            return regulatoryZone ? getRegulatoryZoneURL(type, regulatoryZone) : getAdministrativeZoneURL(type, extent);
        },
        strategy: bboxStrategy,
    });
}

function getAdministrativeZoneURL(type, extent) {
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
        `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
        `outputFormat=application/json&srsname=${WSG84_PROJECTION}&` +
        `bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}`
    );
}

function getRegulatoryZoneURL(type, regulatoryZone) {
    let filter = `layer_name='${regulatoryZone.layerName.replace(/'/g, '\'\'')}' AND zones='${regulatoryZone.zone.replace(/'/g, '\'\'')}'`;
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS` +
        `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
        `&outputFormat=application/json&CQL_FILTER=` +
        filter.replace(/'/g, '%27').replace(/ /g, '%20')
    )
}

export default showLayer