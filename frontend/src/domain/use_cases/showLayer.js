import Layers from "../entities/layers";
import VectorLayer from "ol/layer/Vector";
import {addLayer, addShowedLayer} from "../reducers/Layer";
import {getVectorLayerStyle} from "../../layers/styles/vectorLayerStyles";
import VectorSource, {VectorSourceEvent} from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../entities/map";
import {all, bbox as bboxStrategy} from "ol/loadingstrategy";
import {getHash} from "../../utils";
import {getAdministrativeZoneFromAPI, getRegulatoryZoneFromAPI} from "../../api/fetch";
import {setError} from "../reducers/Global";

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

const setIrretrievableFeaturesEvent = error => {
    return {
        type: IRRETRIEVABLE_FEATURES_EVENT,
        error: error
    }
}

const showLayer = layerToShow => (dispatch, getState) => {
    if(layerToShow && layerToShow.type){
        const getVectorLayerClosure = getVectorLayer(dispatch)

        switch (layerToShow.type) {
            case Layers.EEZ: dispatch(addLayer(getVectorLayerClosure(Layers.EEZ))); break;
            case Layers.FAO: dispatch(addLayer(getVectorLayerClosure(Layers.FAO))); break;
            case Layers.THREE_MILES: dispatch(addLayer(getVectorLayerClosure(Layers.THREE_MILES))); break;
            case Layers.SIX_MILES: dispatch(addLayer(getVectorLayerClosure(Layers.SIX_MILES))); break;
            case Layers.TWELVE_MILES: dispatch(addLayer(getVectorLayerClosure(Layers.TWELVE_MILES))); break;
            case Layers.ONE_HUNDRED_MILES: dispatch(addLayer(getVectorLayerClosure(Layers.ONE_HUNDRED_MILES))); break;
            case Layers.REGULATORY: {
                if (!layerToShow.zone) {
                    console.error("No regulatory layer to show.")
                    return
                }

                let hash = getHash(`${layerToShow.zone.layerName}:${layerToShow.zone.zone}`)
                let gearCategory = getGearCategory(layerToShow.zone.gears, getState().gear.gears);
                let vectorLayer = getVectorLayerClosure(Layers.REGULATORY, layerToShow.zone, hash, gearCategory);
                dispatch(addLayer(vectorLayer));
                break;
            }
        }

        dispatch(addShowedLayer(layerToShow))
    }
}

const getVectorLayer = dispatch => (type, regulatoryZone, hash, gearCategory) => new VectorLayer({
    source: getVectorSource(dispatch)(type, regulatoryZone, dispatch),
    renderMode: 'image',
    className: regulatoryZone ? `${Layers.REGULATORY}:${regulatoryZone.layerName}:${regulatoryZone.zone}` : type,
    style: feature => {
        return [getVectorLayerStyle(type)(feature, hash, gearCategory)]
    }
});

const getVectorSource = dispatch => (type, regulatoryZoneProperties) => {
    const vectorSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: WSG84_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        loader: extent => {
            if (regulatoryZoneProperties) {
                getRegulatoryZoneFromAPI(type, regulatoryZoneProperties).then(regulatoryZone => {
                    vectorSource.addFeatures(vectorSource.getFormat().readFeatures(regulatoryZone))
                }).catch(e => {
                    vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
                    vectorSource.removeLoadedExtent(extent);
                })
            } else {
                getAdministrativeZoneFromAPI(type, extent).then(administrativeZone => {
                    vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZone))
                }).catch(e => {
                    vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
                    vectorSource.removeLoadedExtent(extent);
                })
            }
        },
        strategy: regulatoryZoneProperties ? all : bboxStrategy,
    });

    vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
        console.error(event.error)
        dispatch(setError(event.error))
    })

    return vectorSource
}

function removeMiscellaneousGears(layerGearsArray) {
    return layerGearsArray
        .filter(gearCode => gearCode !== 'MIS')
        .map(gearCode => gearCode);
}

export function getGearCategory(layerGears, gears) {
    let gear = null
    if (layerGears) {
        let layerGearsArray = layerGears.replace(/ /g, '').split(',')
        if (layerGearsArray.length > 1) {
            layerGearsArray = removeMiscellaneousGears(layerGearsArray)
        }
        gear = gears
            .find(gear => {
                return layerGearsArray
                    .some(gearCode => {
                    if (gearCode === gear.code) {
                        return true
                    }
                })
        })
    }
    return gear ? gear.category : null
}

export default showLayer