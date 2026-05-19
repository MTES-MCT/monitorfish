import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { animateToVesselCoordinates } from '@features/Map/useCases/animateMap'
import { AIS_VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/AISVesselsLayer/constants'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { addSelectedAISVessel, resetLoadingVessel } from '@features/Vessel/slice'
import { getFeaturesFromPositions } from '@features/Vessel/types/track'
import { getTrackRequestFromTrackDepth } from '@features/Vessel/types/vesselTrackDepth'
import { unselectVessel } from '@features/Vessel/useCases/unselectVessel'
import { vesselApi } from '@features/Vessel/vesselApi'
import { Level } from '@mtes-mct/monitor-ui'

import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type { MainAppThunk } from '@store'

export const showAISVesselTrack =
  (aisVessel: AISVessel.AISVessel, isFromUserAction: boolean = true): MainAppThunk =>
  async (dispatch, getState) => {
    if (isFromUserAction) {
      animateToVesselCoordinates(aisVessel.coordinates as [number, number], false)
    }

    if (getState().vessel.vesselSidebarIsOpen) {
      dispatch(unselectVessel())
    }

    try {
      const { defaultVesselTrackDepth } = getState().map
      // For now, only the default track request is used
      const nextTrackRequest = getTrackRequestFromTrackDepth(defaultVesselTrackDepth)

      const positions = await dispatch(
        vesselApi.endpoints.getVesselAISPositions.initiate(
          { mmsi: aisVessel.mmsi, trackRequest: nextTrackRequest },
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()

      if (!positions?.length) {
        dispatch(
          addMainWindowBanner({
            children: "Nous n'avons trouvé aucune position AIS pour ce navire",
            closingDelay: 3000,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )

        return
      }

      const feature = AIS_VESSELS_VECTOR_SOURCE.getFeatureById(aisVessel.vesselFeatureId)
      feature?.set('isSelected', true)

      const vesselTrackFeatures = getFeaturesFromPositions(positions, aisVessel.mmsi.toString(10))

      VESSEL_TRACK_VECTOR_SOURCE.addFeatures(vesselTrackFeatures)
      dispatch(addSelectedAISVessel(aisVessel))
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          isFixed: true,
          level: Level.WARNING,
          withAutomaticClosing: true
        })
      )
      dispatch(resetLoadingVessel())
    }
  }
