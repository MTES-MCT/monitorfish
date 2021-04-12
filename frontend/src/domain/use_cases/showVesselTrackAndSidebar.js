import { getVesselFromAPI } from '../../api/fetch'
import { VESSEL_SELECTOR_STYLE } from '../../layers/styles/featuresStyles'
import { loadingVessel, openVesselSidebar, resetLoadingVessel, setSelectedVessel, } from '../reducers/Vessel'
import { animateToVessel } from '../reducers/Map'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from "../../errors/NoDEPFoundError";

const showVesselTrackAndSidebar = (vesselFeatureAndIdentity, fromSearch, updateShowedVessel) => (dispatch, getState) => {
    let alreadySelectedVessel = getState().vessel.selectedVesselFeatureAndIdentity
    if(!updateShowedVessel &&
        alreadySelectedVessel &&
        alreadySelectedVessel.feature === vesselFeatureAndIdentity.feature) {
        if(getState().vessel.selectedVessel) {
            dispatch(openVesselSidebar())
        }

        return
    }

    removePreviousSelectedFeature(getState)
    if(vesselFeatureAndIdentity.feature && !updateShowedVessel) {
        dispatch(animateToVessel(vesselFeatureAndIdentity.feature))
        dispatch(removeError())
    }

    if(!updateShowedVessel) {
        dispatch(loadingVessel(vesselFeatureAndIdentity))
    }

    dispatch(openVesselSidebar())

    getVesselFromAPI(
        vesselFeatureAndIdentity.identity.internalReferenceNumber,
        vesselFeatureAndIdentity.identity.externalReferenceNumber,
        vesselFeatureAndIdentity.identity.ircs,
        getState().map.vesselTrackDepth)
        .then(vesselAndTrackDepthModified => {
            if(vesselAndTrackDepthModified.trackDepthHasBeenModified && !updateShowedVessel) {
                dispatch(setError(new NoDEPFoundError("Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
                  "les positions des dernières 24 heures.")))
            } else {
                dispatch(removeError())
            }

            dispatch(setSelectedVessel(vesselAndTrackDepthModified.vessel))
        }).catch(error => {
            console.error(error)
            dispatch(setError(error))
            dispatch(resetLoadingVessel())
        });
}

function removePreviousSelectedFeature(getState) {
    let previousSelectedFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity
    if (previousSelectedFeatureAndIdentity && previousSelectedFeatureAndIdentity.feature) {
        let stylesWithoutVesselSelector = previousSelectedFeatureAndIdentity.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        previousSelectedFeatureAndIdentity.feature.setStyle([...stylesWithoutVesselSelector])
    }
}

export default showVesselTrackAndSidebar