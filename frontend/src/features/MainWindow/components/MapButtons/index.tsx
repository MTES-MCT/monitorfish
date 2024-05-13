import { Account } from '@features/Account/components/Account'
import { ControlUnitListDialogButton } from '@features/ControlUnit/components/ControlUnitListDialogButton'
import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { InterestPointMapButton } from './InterestPoints'
import { MeasurementMapButton } from './Measurements'
import { VesselFiltersMapButton } from './VesselFilters'
import { VesselLabelsMapButton } from './VesselLabels'
import { VesselVisibilityMapButton } from './VesselVisibility'

export function MapButtons() {
  const isSuperUser = useIsSuperUser()
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
