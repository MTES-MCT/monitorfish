import {getVesselsLastPositionsFromAPI} from "../../api/fetch";
import {transform} from "ol/proj";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../entities/map";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {toStringHDMS} from "ol/coordinate";
import LayersEnum from "../entities/layers";
import {setVesselIconStyle} from "../../layers/styles/featuresStyles";
import Layers from "../entities/layers";
import VectorSource from "ol/source/Vector";
import {replaceVesselLayer} from "../reducers/Layer";
import {setError} from "../reducers/Global";
import showVesselTrackAndSidebar from "./showVesselTrackAndSidebar";
import {updateVesselFeatureAndIdentity} from "../reducers/Vessel";
import {getVesselFeatureAndIdentity} from "../entities/vessel";

const showVesselsLastPosition = () => (dispatch, getState) => {
    getVesselsLastPositionsFromAPI().then(vessels => {
        let vesselsFeatures = vessels
            .filter(vessel => vessel)
            .map((currentVessel, index) => {
                return buildFeature(currentVessel, index, getState, dispatch);
            })

        let vesselLayer = getState().layer.layers.find(layer => layer.className_ === Layers.VESSELS)
        vesselLayer.setSource(
            new VectorSource({
                features: vesselsFeatures
            })
        )

        dispatch(replaceVesselLayer(vesselLayer))
    }).catch(error => {
        console.error(error)
        dispatch(setError(error));
    });

    let vessel = getState().vessel.selectedVesselFeatureAndIdentity
    if(vessel) {
        dispatch(showVesselTrackAndSidebar(vessel, false, true))
    }
}

function buildFeature(currentVessel, index, getState, dispatch) {
    const transformedCoordinates = transform([currentVessel.longitude, currentVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    const iconFeature = new Feature({
        geometry: new Point(transformedCoordinates),
        internalReferenceNumber: currentVessel.internalReferenceNumber,
        externalReferenceNumber: currentVessel.externalReferenceNumber,
        mmsi: currentVessel.mmsi,
        flagState: currentVessel.flagState,
        vesselName: currentVessel.vesselName,
        coordinates: toStringHDMS(transformedCoordinates),
        course: currentVessel.course,
        positionType: currentVessel.positionType,
        speed: currentVessel.speed,
        ircs: currentVessel.ircs,
        dateTime: currentVessel.dateTime
    });

    iconFeature.setId(`${LayersEnum.VESSELS}:${index}`)

    let vesselNamesShowedOnMap = getState().map.vesselNamesHiddenByZoom === undefined ?
        false : getState().map.vesselNamesShowedOnMap && !getState().map.vesselNamesHiddenByZoom;

    let vesselFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity
    let newSelectedVesselFeature = setVesselIconStyle(currentVessel, iconFeature, vesselFeatureAndIdentity, vesselNamesShowedOnMap)
    if (newSelectedVesselFeature) {
        dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(newSelectedVesselFeature, vesselFeatureAndIdentity.identity)))
    }

    return iconFeature;
}

export default showVesselsLastPosition