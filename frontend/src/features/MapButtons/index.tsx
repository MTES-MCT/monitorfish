import { AlertsMapButton } from './AlertsMapButton'
import { BeaconMalfunctionsMapButton } from './BeaconMalfunctionsMapButton'
import { FavoriteVessels } from './FavoriteVessels'
import { InterestPointMapButton } from './InterestPoints'
import { MeasurementMapButton } from './Measurements'
import { MissionsMenu } from './Missions'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'
import { useIsSuperUser } from '../../hooks/authorization/useIsSuperUser'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { ControlUnitListDialogButton } from '../ControlUnit/components/ControlUnitListDialogButton'

export function MapButtons() {
  const isSuperUser = useIsSuperUser()
  const isAlertsMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAlertsMapButtonDisplayed)
  const isBeaconMalfunctionsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isBeaconMalfunctionsMapButtonDisplayed
  )
  const isFavoriteVesselsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isFavoriteVesselsMapButtonDisplayed
  )
  const isInterestPointMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isInterestPointMapButtonDisplayed
  )
  const isMeasurementMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isMeasurementMapButtonDisplayed
  )
  const isVesselFiltersMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselFiltersMapButtonDisplayed
  )
  const isVesselLabelsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselLabelsMapButtonDisplayed
  )
  const isVesselVisibilityMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselVisibilityMapButtonDisplayed
  )

  return (
    <>
      {isSuperUser && isAlertsMapButtonDisplayed && <AlertsMapButton />}
      {isSuperUser && isBeaconMalfunctionsMapButtonDisplayed && <BeaconMalfunctionsMapButton />}
      {isVesselFiltersMapButtonDisplayed && <VesselFiltersMapButton />}
      {isVesselVisibilityMapButtonDisplayed && <VesselVisibilityMapButton />}
      {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
      {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
      {isVesselLabelsMapButtonDisplayed && <VesselLabelsMapButton />}
      {isFavoriteVesselsMapButtonDisplayed && <FavoriteVessels />}
      {isSuperUser && isFavoriteVesselsMapButtonDisplayed && <MissionsMenu />}
      {isSuperUser && <ControlUnitListDialogButton />}
    </>
  )
}
