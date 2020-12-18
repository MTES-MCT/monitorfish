import Layers from "../entities/layers";
import VectorLayer from "ol/layer/Vector";
import {addLayer, addShowedLayer} from "../reducers/Layer";
import {getVectorLayerStyle} from "../../layers/styles/vectorLayerStyles";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../entities/map";
import {all, bbox as bboxStrategy} from "ol/loadingstrategy";
import {getHash} from "../../utils";
import {getAdministrativeZoneURL, getRegulatoryZoneURL} from "../../api/fetch";

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

                let hash = getHash(`${layerToShow.zone.layerName}:${layerToShow.zone.zone}`)
                let gearCategory = getGearCategory(layerToShow, getState);
                dispatch(addLayer(getVectorLayer(Layers.REGULATORY, layerToShow.zone, hash, gearCategory)));
                break;
            }
        }

        dispatch(addShowedLayer(layerToShow))
    }
}

const getVectorLayer = (type, regulatoryZone, hash, gearCategory) => new VectorLayer({
    source: getVectorSource(type, regulatoryZone),
    renderMode: 'image',
    className: regulatoryZone ? `${Layers.REGULATORY}:${regulatoryZone.layerName}:${regulatoryZone.zone}` : type,
    style: feature => {
        return [getVectorLayerStyle(type, regulatoryZone)(feature, hash, gearCategory)]
    }
});

const getVectorSource = (type, regulatoryZone) => {
    return new VectorSource({
        format: new GeoJSON({
            dataProjection: WSG84_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        url: extent => {
            if (regulatoryZone) {
                try {
                    return getRegulatoryZoneURL(type, regulatoryZone);
                } catch (e) {
                    console.error(e)
                }
            } else {
                return getAdministrativeZoneURL(type, extent);
            }
        },
        strategy: regulatoryZone ? all : bboxStrategy,
    });
}

function getGearCategory(layerToShow, getState) {
    let gear = null
    if (layerToShow.zone.gears) {
        let layerGearsArray = layerToShow.zone.gears.replace(/ /g, '').split(',')
        gear = getState().gear.gears
            .find(gear => {
                return layerGearsArray.some(gearCode => {
                    if (gearCode === gear.code) {
                        if(gearCode === "LLS") console.log("FOUNDDDD")
                        return true
                    }
                })
        })
    }
    return gear ? gear.category : null
}

export default showLayer