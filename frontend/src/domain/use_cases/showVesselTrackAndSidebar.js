import { getVesselFromAPI } from '../../api/fetch'
import { selectedVesselStyle, VESSEL_SELECTOR_STYLE } from '../../layers/styles/featuresStyles'
import { loadingVessel, openVesselSidebar, resetLoadingVessel, setSelectedVessel, } from '../reducers/Vessel'
import { animateToVessel } from '../reducers/Map'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'

const showVesselTrackAndSidebar = (
  vesselFeatureAndIdentity,
  fromSearch,
  updateShowedVessel,
  vesselTrackDepthObject) => (dispatch, getState) => {
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

    const nextVesselTrackDepthObject = getVesselTrackDepth(
      updateShowedVessel,
      vesselTrackDepthObject,
      getState().vessel.temporaryTrackDepth,
      getState().map.vesselTrackDepth)

    getVesselFromAPI(
        vesselFeatureAndIdentity.identity.internalReferenceNumber,
        vesselFeatureAndIdentity.identity.externalReferenceNumber,
        vesselFeatureAndIdentity.identity.ircs,
        nextVesselTrackDepthObject)
        .then(vesselAndTrackDepthModified => {
            if(vesselAndTrackDepthModified.trackDepthHasBeenModified && !updateShowedVessel) {
                dispatch(setError(new NoDEPFoundError("Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
                  "les positions des dernières 24 heures.")))
            } else {
                dispatch(removeError())
            }

            if(vesselAndTrackDepthModified.vessel.positions && !vesselAndTrackDepthModified.vessel.positions.length) {
                getState().vessel.selectedVesselFeatureAndIdentity.feature.setStyle([
                    ...getState().vessel.selectedVesselFeatureAndIdentity.feature.getStyle(),
                      selectedVesselStyle
                  ])
                dispatch(setError(new NoPositionsFoundError("Nous n'avons trouvé aucune position pour ces dates.")))
            }

            dispatch(setSelectedVessel(vesselAndTrackDepthModified.vessel))
        }).catch(error => {
            console.error(error)
            dispatch(setError(error))
            dispatch(resetLoadingVessel())
        });
}

function getVesselTrackDepth (updateShowedVessel, trackDepthParameters, temporaryTrackDepth, vesselTrackDepth) {
    let nextTrackDepth, nextAfterDateTime, nextBeforeDateTime

    if (updateShowedVessel) {
        nextTrackDepth = temporaryTrackDepth.trackDepth
        nextAfterDateTime = temporaryTrackDepth.afterDateTime
        nextBeforeDateTime = temporaryTrackDepth.beforeDateTime
    } else {
        if (!trackDepthParameters ||
          (!trackDepthParameters.trackDepth &&
            !trackDepthParameters.afterDateTime &&
            !trackDepthParameters.beforeDateTime)) {
            nextTrackDepth = vesselTrackDepth
        }
    }

    return {
        trackDepth: nextTrackDepth,
        afterDateTime: nextAfterDateTime,
        beforeDateTime : nextBeforeDateTime
    }
}

function removePreviousSelectedFeature(getState) {
    let previousSelectedFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity
    if (previousSelectedFeatureAndIdentity && previousSelectedFeatureAndIdentity.feature) {
        let stylesWithoutVesselSelector = previousSelectedFeatureAndIdentity.feature.getStyle()
          .filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        previousSelectedFeatureAndIdentity.feature.setStyle([...stylesWithoutVesselSelector])
    }
}

export default showVesselTrackAndSidebar