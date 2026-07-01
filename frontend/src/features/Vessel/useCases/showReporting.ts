import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { LayerProperties, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { animateToVesselCoordinates } from '@features/Map/useCases/animateMap'
import { reportingActions } from '@features/Reporting/slice'
import { editReportingFromMap } from '@features/Reporting/useCases/editReportingFromMap'
import { closeVesselSidebar, loadingVessel, resetLoadingVessel, setSelectedVessel } from '@features/Vessel/slice'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { displayedComponentActions } from 'domain/shared_slices/DisplayedComponent'
import { transform } from 'ol/proj'

import { openVesselSidebarTab } from './openVesselSidebarTab'
import { unselectVessel } from './unselectVessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { VesselSidebarTab } from '../types/vessel'
import { getCustomOrDefaultTrackRequest } from '../types/vesselTrackDepth'
import { extractVesselIdentityProps } from '../utils'
import { vesselApi } from '../vesselApi'

import type { Reporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

/**
 * Show a reporting in the main window
 */
export const showReporting =
  (reporting: Reporting.Reporting): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch(unselectVessel())

      let positionToMoveTo: [number, number] | undefined

      // if reporting has a position, we will center the map on that
      if (reporting.longitude !== undefined && reporting.latitude !== undefined) {
        positionToMoveTo = [reporting.longitude, reporting.latitude]
      }

      // adapted from the logic of GetVesselReportings
      const reportingHasVessel =
        reporting.vesselId !== undefined ||
        reporting.cfr !== undefined ||
        reporting.externalMarker !== undefined ||
        reporting.ircs !== undefined

      if (reportingHasVessel) {
        // fetching vessel info

        const vesselIdentity = extractVesselIdentityProps(reporting)
        dispatch(loadingVessel(vesselIdentity))

        const {
          map: { defaultVesselTrackDepth },
          vessel: { selectedVesselTrackRequest }
        } = getState()

        const nextTrackRequest = getCustomOrDefaultTrackRequest(
          selectedVesselTrackRequest,
          defaultVesselTrackDepth,
          false
        )
        const { vesselAndPositions } = await dispatch(
          vesselApi.endpoints.getVesselAndPositions.initiate(
            { trackRequest: nextTrackRequest, vesselIdentity },
            RTK_FORCE_REFETCH_QUERY_OPTIONS
          )
        ).unwrap()

        // if the reporting has no position but the vessel has one,
        // we will center the map on the vessel position
        const { vessel } = vesselAndPositions
        if (
          positionToMoveTo === undefined &&
          vessel.lastPositionLongitude !== undefined &&
          vessel.lastPositionLatitude !== undefined
        ) {
          positionToMoveTo = [vessel.lastPositionLongitude, vessel.lastPositionLatitude]
        }

        // closing reporting form, in case it was open for a different reporting
        dispatch(
          displayedComponentActions.setDisplayedComponents({
            isReportingMapFormDisplayed: false
          })
        )
        dispatch(reportingActions.unsetEditedReporting())

        // opening vessel sidebar at reporting tab
        dispatch(setSelectedVessel(vesselAndPositions))
        dispatch(openVesselSidebarTab(VesselSidebarTab.REPORTING))
      }

      // centering map on position if any
      if (positionToMoveTo !== undefined) {
        const coordinates = transform(positionToMoveTo, WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        if (coordinates[0] !== undefined && coordinates[1] !== undefined) {
          const isVesselSidebarOpen = true // vessel sidebar or reporting form will be open so we can set this to true in all cases
          animateToVesselCoordinates([coordinates[0], coordinates[1]], isVesselSidebarOpen)
        }
      }

      if (!reportingHasVessel) {
        // closing vessel sidebar and opening reporting form
        dispatch(closeVesselSidebar())
        dispatch(editReportingFromMap(reporting.id))
      }

      // open reporting popup
      const featureId = `${LayerProperties.REPORTING.code}:${reporting.id}`
      dispatch(reportingActions.selectReportingFeatureId(featureId))
    } catch (error) {
      dispatch(displayOrLogError(error as Error, undefined, true, DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR))
      dispatch(resetLoadingVessel())
    }
  }
