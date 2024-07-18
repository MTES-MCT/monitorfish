import { Account } from '@features/Account/components/Account'
import { ControlUnitListMapButton } from '@features/ControlUnit/components/ControlUnitListMapButton'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { AlertsMapButton } from './AlertsMapButton'
import { BeaconMalfunctionsMapButton } from './BeaconMalfunctionsMapButton'
import { FavoriteVessels } from './FavoriteVessels'
import { MissionsMenu } from './Missions'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { InterestPointMapButton } from '../../../InterestPoint/components/InterestPointMapButton'
import { MeasurementMapButton } from '../../../Measurement/components/MeasurementMapButton'
import { PriorNotificationListButton } from '../../../PriorNotification/components/PriorNotificationListButton'

export function MapButtons() {
  const isSuperUser = useIsSuperUser()
  const isAlertsMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAlertsMapButtonDisplayed)
  const isAccountMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAccountMapButtonDisplayed)
  const isPriorNotificationMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isPriorNotificationMapButtonDisplayed
  )
  const isControlUnitListMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListMapButtonDisplayed
  )
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
        {(isSuperUser || import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true') &&
          isPriorNotificationMapButtonDisplayed && <PriorNotificationListButton />}
        {isSuperUser && isBeaconMalfunctionsMapButtonDisplayed && <BeaconMalfunctionsMapButton />}

        {isVesselFiltersMapButtonDisplayed && <VesselFiltersMapButton />}
        {isVesselVisibilityMapButtonDisplayed && <VesselVisibilityMapButton />}
        {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
        {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
        {isVesselLabelsMapButtonDisplayed && <VesselLabelsMapButton />}
        {isAccountMapButtonDisplayed && <Account />}
      </LegacyRsuiteComponentsWrapper>

      {isSuperUser && isControlUnitListMapButtonDisplayed && <ControlUnitListMapButton />}
    </>
  )
}
