import { Account } from '@features/Account/components/Account'
import { ControlUnitListDialogButton } from '@features/ControlUnit/components/ControlUnitListDialogButton'
import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { AlertsMapButton } from './AlertsMapButton'
import { BeaconMalfunctionsMapButton } from './BeaconMalfunctionsMapButton'
import { FavoriteVessels } from './FavoriteVessels'
import { InterestPointMapButton } from './InterestPoints'
import { MeasurementMapButton } from './Measurements'
import { MissionsMenu } from './Missions'
import { PriorNotificationListButton } from './PriorNotificationListButton'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'

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
      <LegacyRsuiteComponentsWrapper>
        {isFavoriteVesselsMapButtonDisplayed && <FavoriteVessels />}
        {isSuperUser && isFavoriteVesselsMapButtonDisplayed && <MissionsMenu />}
        {isSuperUser && isAlertsMapButtonDisplayed && <AlertsMapButton />}
        {import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true' && <PriorNotificationListButton />}
        {isSuperUser && isBeaconMalfunctionsMapButtonDisplayed && <BeaconMalfunctionsMapButton />}

        {isVesselFiltersMapButtonDisplayed && <VesselFiltersMapButton />}
        {isVesselVisibilityMapButtonDisplayed && <VesselVisibilityMapButton />}
        {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
        {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
        {isVesselLabelsMapButtonDisplayed && <VesselLabelsMapButton />}
        <Account />
      </LegacyRsuiteComponentsWrapper>

      {isSuperUser && <ControlUnitListDialogButton />}
    </>
  )
}
