import { AlertsMapButton } from './AlertsMapButton'
import { BeaconMalfunctionsMapButton } from './BeaconMalfunctionsMapButton'
import { FavoriteVessels } from './FavoriteVessels'
import { InterestPointMapButton } from './InterestPoints'
import { MeasurementMapButton } from './Measurements'
import { MissionsMenu } from './Missions'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function MapButtons() {
  const {
    isAlertsMapButtonDisplayed,
    isBeaconMalfunctionsMapButtonDisplayed,
    isFavoriteVesselsMapButtonDisplayed,
    isInterestPointMapButtonDisplayed,
    isMeasurementMapButtonDisplayed,
    isVesselFiltersMapButtonDisplayed,
    isVesselLabelsMapButtonDisplayed,
    isVesselVisibilityMapButtonDisplayed
  } = useMainAppSelector(state => state.displayedComponent)

  return (
    <>
      {isAlertsMapButtonDisplayed && <AlertsMapButton />}
      {isBeaconMalfunctionsMapButtonDisplayed && <BeaconMalfunctionsMapButton />}
      {isVesselFiltersMapButtonDisplayed && <VesselFiltersMapButton />}
      {isVesselVisibilityMapButtonDisplayed && <VesselVisibilityMapButton />}
      {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
      {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
      {isVesselLabelsMapButtonDisplayed && <VesselLabelsMapButton />}
      {isFavoriteVesselsMapButtonDisplayed && <FavoriteVessels />}
      {isFavoriteVesselsMapButtonDisplayed && <MissionsMenu />}
    </>
  )
}
