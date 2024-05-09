import { Account } from '@features/Account/components/Account'
import { ControlUnitListDialogButton } from '@features/ControlUnit/components/ControlUnitListDialogButton'
import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { BeaconMalfunctionsMapButton } from './BeaconMalfunctionsMapButton'
import { FavoriteVessels } from './FavoriteVessels'
import { InterestPointMapButton } from './InterestPoints'
import { MeasurementMapButton } from './Measurements'
import { PriorNotificationListButton } from './PriorNotificationListButton'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'

export function MapButtons() {
  const isSuperUser = useIsSuperUser()
  const isBeaconMalfunctionsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isBeaconMalfunctionsLeftMenuButtonDisplayed
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
        {import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true' && <PriorNotificationListButton />}
        {isSuperUser && isBeaconMalfunctionsLeftMenuButtonDisplayed && <BeaconMalfunctionsMapButton />}

        {isVesselFiltersRightMenuButtonDisplayed && <VesselFiltersMapButton />}
        {isVesselVisibilityRightMenuButtonDisplayed && <VesselVisibilityMapButton />}
        {isMeasurementRightMenuButtonDisplayed && <MeasurementMapButton />}
        {isInterestPointRightMenuButtonDisplayed && <InterestPointMapButton />}
        {isVesselLabelsRightMenuButtonDisplayed && <VesselLabelsMapButton />}
        <Account />
      </LegacyRsuiteComponentsWrapper>

      {isSuperUser && <ControlUnitListDialogButton />}
    </>
  )
}
