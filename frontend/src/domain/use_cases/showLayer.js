import Layers from "../entities/layers";
import VectorLayer from "ol/layer/Vector";
import {addLayer, addShowedLayer, pushLayerAndArea, setLastShowedFeatures} from "../reducers/Layer";
import {getVectorLayerStyle} from "../../layers/styles/vectorLayerStyles";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {OPENLAYERS_PROJECTION, WSG84_PROJECTION} from "../entities/map";
import {all, bbox as bboxStrategy} from "ol/loadingstrategy";
import {getHash} from "../../utils";
import {getAdministrativeZoneFromAPI, getRegulatoryZoneFromAPI} from "../../api/fetch";
import {setError} from "../reducers/Global";
import {getArea, getCenter} from "ol/extent";
import {animateToRegulatoryLayer} from "../reducers/Map";

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
            case Layers.EEZ.code: dispatch(addLayer(getVectorLayerClosure(Layers.EEZ.code))); break;
            case Layers.FAO.code: dispatch(addLayer(getVectorLayerClosure(Layers.FAO.code))); break;
            case Layers.THREE_MILES.code: dispatch(addLayer(getVectorLayerClosure(Layers.THREE_MILES.code))); break;
            case Layers.SIX_MILES.code: dispatch(addLayer(getVectorLayerClosure(Layers.SIX_MILES.code))); break;
            case Layers.TWELVE_MILES.code: dispatch(addLayer(getVectorLayerClosure(Layers.TWELVE_MILES.code))); break;
            case Layers.REGULATORY.code: {
                if (!layerToShow.zone) {
                    console.error("No regulatory layer to show.")
                    return
                }

                let hash = getHash(`${layerToShow.zone.layerName}:${layerToShow.zone.zone}`)
                let gearCategory = getGearCategory(layerToShow.zone.gears, getState().gear.gears);
                let vectorLayer = getVectorLayerClosure(Layers.REGULATORY.code, layerToShow.zone, hash, gearCategory);
                dispatch(addLayer(vectorLayer));
                break;
            }
            default: dispatch(addLayer(getVectorLayerClosure(layerToShow.type))); break;
        }

        dispatch(addShowedLayer(layerToShow))
    }
}

const getVectorLayer = dispatch => (type, regulatoryZone, hash, gearCategory) => new VectorLayer({
    source: getVectorSource(dispatch)(type, regulatoryZone),
    renderMode: 'image',
    className: regulatoryZone ? `${Layers.REGULATORY.code}:${regulatoryZone.layerName}:${regulatoryZone.zone}` : type,
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
                    dispatch(setLastShowedFeatures(vectorSource.getFeatures()))
                    dispatch(pushLayerAndArea({
                        name: `${type}:${regulatoryZoneProperties.layerName}:${regulatoryZoneProperties.zone}`,
                        area: getArea(vectorSource.getExtent())
                    }))
                    const center = getCenter(vectorSource.getExtent())
                    if(center && center.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
                        dispatch(animateToRegulatoryLayer({
                            name: `${type}:${regulatoryZoneProperties.layerName}:${regulatoryZoneProperties.zone}`,
                            center: center
                        }))
                    }
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

function removeVariousLonglineGears(layerGearsArray) {
    return layerGearsArray
        .filter(gearCode => gearCode !== 'LL')
        .map(gearCode => gearCode);
}

export function getGearCategory(layerGears, gears) {
    let gear = null
    if (layerGears) {
        let layerGearsArray = layerGears.replace(/ /g, '').split(',')
        if (layerGearsArray.length > 1) {
            layerGearsArray = removeMiscellaneousGears(layerGearsArray)
        }
        if (layerGearsArray.length > 1) {
            layerGearsArray = removeVariousLonglineGears(layerGearsArray)
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