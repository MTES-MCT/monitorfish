import {getVesselsLastPositionsFromAPI} from "../api/fetch";
import {transform} from "ol/proj";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {toStringHDMS} from "ol/coordinate";
import LayersEnum from "../domain/layers";
import {setVesselIconStyle} from "../layers/styles/featuresStyles";
import Layers from "../domain/layers";
import VectorSource from "ol/source/Vector";
import {replaceVesselLayer, setLayers, showLayer} from "../reducers/Layer";
import VectorLayer from "ol/layer/Vector";
import {setError} from "../reducers/Global";

const showVesselsLastPosition = () => (dispatch, getState) => {
    if(getState().layer.layers.length === 0){
        const initialVesselsLayer = new VectorLayer({
            source: new VectorSource(),
            className: Layers.VESSELS
        })
        dispatch(setLayers([initialVesselsLayer]));
    }

    getVesselsLastPositionsFromAPI().then(vessels => {
        let vesselsFeatures = vessels
            .filter(vessel => vessel)
            .map((currentVessel, index) => {
                return buildFeature(currentVessel, index, getState);
            })

        let vesselLayer = getState().layer.layers.find(layer => layer.className_ === Layers.VESSELS)
        vesselLayer.setSource(
            new VectorSource({
                features: vesselsFeatures
            })
        )

        dispatch(replaceVesselLayer(vesselLayer))
        dispatch(showLayer({type: Layers.VESSELS}))
    }).catch(error => {
        dispatch(setError(error));
    });
}

function buildFeature(currentVessel, index, getState) {
    const transformedCoordinates = transform([currentVessel.longitude, currentVessel.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)

    const iconFeature = new Feature({
        geometry: new Point(transformedCoordinates),
        internalReferenceNumber: currentVessel.internalReferenceNumber,
        externalReferenceNumber: currentVessel.externalReferenceNumber,
        MMSI: currentVessel.MMSI,
        flagState: currentVessel.flagState,
        vesselName: currentVessel.vesselName,
        coordinates: toStringHDMS(transformedCoordinates),
        course: currentVessel.course,
        positionType: currentVessel.positionType,
        speed: currentVessel.speed,
        IRCS: currentVessel.IRCS,
        dateTime: currentVessel.dateTime
    });

    iconFeature.setId(`${LayersEnum.VESSELS}:${index}`)

    let vesselNamesShowedOnMap = getState().map.vesselNamesHiddenByZoom === undefined ?
        false : getState().map.vesselNamesShowedOnMap && !getState().map.vesselNamesHiddenByZoom;
    setVesselIconStyle(currentVessel, iconFeature, getState().vessel.selectedVesselFeature, vesselNamesShowedOnMap);

    return iconFeature;
}

export default showVesselsLastPosition