import { Account } from '@features/Account/components/Account'
import { ControlUnitListMapButton } from '@features/ControlUnit/components/ControlUnitListMapButton'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { BeaconMalfunctionsMapButton } from './BeaconMalfunctionsMapButton'
import { FavoriteVessels } from './FavoriteVessels'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { InterestPointMapButton } from '../../../InterestPoint/components/InterestPointMapButton'
import { MeasurementMapButton } from '../../../Measurement/components/MeasurementMapButton'
import { PriorNotificationListButton } from '../../../PriorNotification/components/PriorNotificationListButton'

export function MapButtons() {
  const isSuperUser = useIsSuperUser()
  const isAccountMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAccountMapButtonDisplayed)
  const isBeaconMalfunctionsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isBeaconMalfunctionsLeftMenuButtonDisplayed
  )
  const isControlUnitListMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListMapButtonDisplayed
  )
  const isFavoriteVesselsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isFavoriteVesselsLeftMenuButtonDisplayed
  )
  const isInterestPointRightMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isInterestPointRightMenuButtonDisplayed
  )
  const isMeasurementRightMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isMeasurementRightMenuButtonDisplayed
  )
  const isPriorNotificationLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isPriorNotificationLeftMenuButtonDisplayed
  )
  const isVesselFiltersRightMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselFiltersRightMenuButtonDisplayed
  )
  const isVesselLabelsRightMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselLabelsRightMenuButtonDisplayed
  )
  const isVesselVisibilityRightMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselVisibilityRightMenuButtonDisplayed
  )

  return (
    <>
      <LegacyRsuiteComponentsWrapper>
        {isFavoriteVesselsLeftMenuButtonDisplayed && <FavoriteVessels />}
        {(isSuperUser || import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true') &&
          isPriorNotificationLeftMenuButtonDisplayed && <PriorNotificationListButton />}
        {isSuperUser && isBeaconMalfunctionsLeftMenuButtonDisplayed && <BeaconMalfunctionsMapButton />}

        {isVesselFiltersRightMenuButtonDisplayed && <VesselFiltersMapButton />}
        {isVesselVisibilityRightMenuButtonDisplayed && <VesselVisibilityMapButton />}
        {isMeasurementRightMenuButtonDisplayed && <MeasurementMapButton />}
        {isInterestPointRightMenuButtonDisplayed && <InterestPointMapButton />}
        {isVesselLabelsRightMenuButtonDisplayed && <VesselLabelsMapButton />}
        {isAccountMapButtonDisplayed && <Account />}
      </LegacyRsuiteComponentsWrapper>

      {isSuperUser && isControlUnitListMapButtonDisplayed && <ControlUnitListMapButton />}
    </>
  )
}
