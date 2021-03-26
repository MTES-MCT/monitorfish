import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {OPENLAYERS_PROJECTION, WSG84_PROJECTION} from "../entities/map";
import {getAdministrativeZoneFromAPI} from "../../api/fetch";
import {all} from "ol/loadingstrategy";
import {addZoneSelected} from "../reducers/Map";

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

const setIrretrievableFeaturesEvent = error => {
    return {
        type: IRRETRIEVABLE_FEATURES_EVENT,
        error: error
    }
}

const getAdministrativeZoneGeometry = (administrativeZoneCode, subZoneCode, zoneName) => (dispatch) => {
    let vectorSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: WSG84_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
        }),
        strategy: all,
    })

    getAdministrativeZoneFromAPI(administrativeZoneCode, null, subZoneCode).then(administrativeZoneFeature => {
        vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZoneFeature))
        if(vectorSource.getFeatures().length === 1) {
            dispatch(addZoneSelected({
                name: zoneName,
                code: subZoneCode ? subZoneCode : administrativeZoneCode,
                feature: vectorSource.getFeatures()[0]
            }))
        } else {
            console.error(`Vector ${administrativeZoneFeature}:${subZoneCode} has ${vectorSource.getFeatures().length} features. It should have only one feature.`)
        }
    }).catch(e => {
        vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
    })

    vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
        console.error(event.error)
    })
}

export default getAdministrativeZoneGeometry