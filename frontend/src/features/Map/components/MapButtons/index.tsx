import { Account } from '@features/Account/components/Account'
import { ActivityVisualizationMapButton } from '@features/ActivityVisualization/components/ActivityVisualizationMapButton'
import { ControlUnitListMapButton } from '@features/ControlUnit/components/ControlUnitListMapButton'
import { NewFeatures } from '@features/NewFeatures/components/NewFeatures'
import { VesselListMapButton } from '@features/Vessel/components/VesselListMapButton'
import { VesselGroupMapButton } from '@features/VesselGroup/components/VesselGroupMapButton'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { LegacyRsuiteComponentsWrapper } from '../../../../ui/LegacyRsuiteComponentsWrapper'

import { MapSettingsButton } from '../MapSettingsButton'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { AlertsMapButton } from '../../../Alert/components/AlertsMapButton'
import { BeaconMalfunctionsMapButton } from '../../../BeaconMalfunction/components/BeaconMalfunctionsMapButton'
import { FavoriteVessels } from '../../../FavoriteVessel/components/FavoriteVessels'
import { InterestPointMapButton } from '../../../InterestPoint/components/InterestPointMapButton'
import { MeasurementMapButton } from '../../../Measurement/components/MeasurementMapButton'
import { MissionsMapMenu } from '../../../Mission/components/MissionsMapMenu'
import { PriorNotificationListButton } from '../../../PriorNotification/components/PriorNotificationListButton'

export function MapButtons() {
  const isSuperUser = useIsSuperUser()
  const isAlertsMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAlertsMapButtonDisplayed)
  const isNewFeaturesMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isNewFeaturesMapButtonDisplayed
  )
  const isAccountMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAccountMapButtonDisplayed)
  const isActivityVisualizationMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isActivityVisualizationMapButtonDisplayed
  )
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
  const isVesselVisibilityMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselVisibilityMapButtonDisplayed
  )
  const isVesselListMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselListMapButtonDisplayed
  )
  const isVesselGroupMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselGroupMapButtonDisplayed
  )

  return (
    <>
      <LegacyRsuiteComponentsWrapper>
        {isFavoriteVesselsMapButtonDisplayed && <FavoriteVessels />}
        {isSuperUser && isFavoriteVesselsMapButtonDisplayed && <MissionsMapMenu />}
        {isSuperUser && isAlertsMapButtonDisplayed && <AlertsMapButton />}
        {(isSuperUser || import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true') &&
          isPriorNotificationMapButtonDisplayed && <PriorNotificationListButton />}
        {isSuperUser && isBeaconMalfunctionsMapButtonDisplayed && <BeaconMalfunctionsMapButton />}
        {isActivityVisualizationMapButtonDisplayed && <ActivityVisualizationMapButton />}

        {isVesselListMapButtonDisplayed && <VesselListMapButton />}
        {isVesselGroupMapButtonDisplayed && <VesselGroupMapButton />}
        {isVesselVisibilityMapButtonDisplayed && <MapSettingsButton />}
        {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
        {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
        {isAccountMapButtonDisplayed && <Account />}
        {isNewFeaturesMapButtonDisplayed && <NewFeatures />}
      </LegacyRsuiteComponentsWrapper>

      {isSuperUser && isControlUnitListMapButtonDisplayed && <ControlUnitListMapButton />}
    </>
  )
}
