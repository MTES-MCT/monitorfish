import {getVesselsLastPositionsFromAPI} from "../../api/fetch";
import {transform} from "ol/proj";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../entities/map";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {toStringHDMS} from "ol/coordinate";
import LayersEnum, {vesselIconIsLight} from "../entities/layers";
import {setVesselIconStyle, VESSEL_ICON_STYLE} from "../../layers/styles/featuresStyles";
import Layers from "../entities/layers";
import VectorSource from "ol/source/Vector";
import {replaceVesselLayer} from "../reducers/Layer";
import {setError} from "../reducers/Global";
import {updateVesselFeatureAndIdentity} from "../reducers/Vessel";
import {getVesselFeatureAndIdentity} from "../entities/vessel";
import {useEffect} from "react";

const showVesselsLastPosition = () => (dispatch, getState) => {
    getVesselsLastPositionsFromAPI().then(vessels => {
        let vesselsFeaturesPromise = vessels
            .filter(vessel => vessel)
            .map((currentVessel, index) => {
                return buildFeature(currentVessel, index, getState, dispatch)
                    .then(feature => feature)
            })

        Promise.all(vesselsFeaturesPromise).then(vesselsFeatures => {
            let vesselLayer = getState().layer.layers.find(layer => layer.className_ === Layers.VESSELS)
            vesselLayer.setSource(
                new VectorSource({
                    features: vesselsFeatures
                })
            )

            dispatch(replaceVesselLayer(vesselLayer))
        })
    }).catch(error => {
        console.error(error)
        dispatch(setError(error));
    });
}

const buildFeature = (currentVessel, index, getState, dispatch) => new Promise(resolve =>  {
    const transformedCoordinates = transform([currentVessel.longitude, currentVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    const feature = new Feature({
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

    feature.setId(`${LayersEnum.VESSELS}:${index}`)

    let selectedVesselFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity
    let vesselLabelsShowedOnMap = getState().map.vesselNamesHiddenByZoom === undefined ?
        false : getState().map.vesselLabelsShowedOnMap && !getState().map.vesselNamesHiddenByZoom;
    let isLight = vesselIconIsLight(getState().map.selectedBaseLayer)
    let temporaryVesselsToHighLightOnMap = getState().vessel.temporaryVesselsToHighLightOnMap
    let vesselsLastPositionVisibility = getState().map.vesselsLastPositionVisibility
    let vesselLabel = getState().map.vesselLabel

    const options = {
        selectedVesselFeatureAndIdentity: selectedVesselFeatureAndIdentity,
        vesselLabelsShowedOnMap: vesselLabelsShowedOnMap,
        vesselsLastPositionVisibility: vesselsLastPositionVisibility,
        vesselLabel: vesselLabel,
        isLight: isLight,
        temporaryVesselsToHighLightOnMap: temporaryVesselsToHighLightOnMap,
    }

    setVesselIconStyle(
        currentVessel,
        feature,
        options)
        .then(newSelectedVesselFeature => {
            if (newSelectedVesselFeature) {
                dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(newSelectedVesselFeature, selectedVesselFeatureAndIdentity.identity)))
            }

            resolve(feature)
    })
})

export default showVesselsLastPosition