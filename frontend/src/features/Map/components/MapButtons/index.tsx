import { Account } from '@features/Account/components/Account'
import { ActivityVisualizationMapButton } from '@features/ActivityVisualization/components/ActivityVisualizationMapButton'
import { ControlUnitListMapButton } from '@features/ControlUnit/components/ControlUnitListMapButton'
import { LayersSidebar } from '@features/LayersSidebar/components'
import { RightMenuOnHoverArea } from '@features/Map/components/MapButtons/shared/RightMenuOnHoverArea'
import { NewFeatures } from '@features/NewFeatures/components/NewFeatures'
import { ReportingMapButton } from '@features/Reporting/components/ReportingMapButton'
import { AISVesselsButton } from '@features/Vessel/components/AISVesselsButton'
import { VesselListMapButton } from '@features/Vessel/components/VesselListMapButton'
import { VesselLoader } from '@features/Vessel/components/VesselLoader'
import { VesselSidebar } from '@features/Vessel/components/VesselSidebar/components'
import { VesselSidebarHeader } from '@features/Vessel/components/VesselSidebar/components/VesselSidebarHeader'
import { VesselGroupMapButton } from '@features/VesselGroup/components/VesselGroupMapButton'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { AlertsMapButton } from '../../../Alert/components/AlertsMapButton'
import { BeaconMalfunctionsMapButton } from '../../../BeaconMalfunction/components/BeaconMalfunctionsMapButton'
import { FavoriteVessels } from '../../../FavoriteVessel/components/FavoriteVessels'
import { InterestPointMapButton } from '../../../InterestPoint/components/InterestPointMapButton'
import { MeasurementMapButton } from '../../../Measurement/components/MeasurementMapButton'
import { MissionsMapMenu } from '../../../Mission/components/MissionsMapMenu'
import { PriorNotificationListButton } from '../../../PriorNotification/components/PriorNotificationListButton'
import { MapSettingsButton } from '../MapSettingsButton'
import { VesselSearchButton } from './VesselSearchButton'

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
  const isMissionsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isMissionsMapButtonDisplayed
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
  const isReportingMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isReportingMapButtonDisplayed
  )
  const isVesselSearchDisplayed = useMainAppSelector(state => state.displayedComponent.isVesselSearchDisplayed)
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const top = useGetTopOffset()

  return (
    <>
      <RightMenuOnHoverArea />
      <LeftMenu $top={top}>
        <TopSection>
          <Group>
            <MenuItem>
              <LayersSidebar />
            </MenuItem>
          </Group>
          {isFavoriteVesselsMapButtonDisplayed && (
            <Group>
              <MenuItem>
                <FavoriteVessels />
              </MenuItem>
            </Group>
          )}
          <Group>
            {isSuperUser && isMissionsMapButtonDisplayed && (
              <MenuItem>
                <MissionsMapMenu />
              </MenuItem>
            )}
            {isSuperUser && isAlertsMapButtonDisplayed && (
              <MenuItem>
                <AlertsMapButton />
              </MenuItem>
            )}
            {(isSuperUser || import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true') &&
              isPriorNotificationMapButtonDisplayed && (
                <MenuItem>
                  <PriorNotificationListButton />
                </MenuItem>
              )}
            {isSuperUser && isBeaconMalfunctionsMapButtonDisplayed && (
              <MenuItem>
                <BeaconMalfunctionsMapButton />
              </MenuItem>
            )}
          </Group>

          {isActivityVisualizationMapButtonDisplayed && (
            <Group>
              <MenuItem>
                <ActivityVisualizationMapButton />
              </MenuItem>
            </Group>
          )}
        </TopSection>
        <BottomSection>
          <Group>
            {isMeasurementMapButtonDisplayed && (
              <MenuItem>
                <MeasurementMapButton />
              </MenuItem>
            )}
            {isInterestPointMapButtonDisplayed && (
              <MenuItem>
                <InterestPointMapButton />
              </MenuItem>
            )}
          </Group>
        </BottomSection>
      </LeftMenu>
      <TopBar $isRightMenuOpen={rightMenuIsOpen} $top={top}>
        <VesselLoader />
        {import.meta.env.FRONTEND_AIS_VESSELS_ENABLED === 'true' && <AISVesselsButton />}
        {isVesselSearchDisplayed && <VesselSidebarHeader />}
        <VesselSearchButton />
      </TopBar>
      {isVesselSidebarOpen && (
        <VesselSidebarContainer $isReportingOpen={isReportingMapFormDisplayed} $top={top}>
          <VesselSidebar />
        </VesselSidebarContainer>
      )}
      <RightMenu $hasSearchButton={isVesselSearchDisplayed} $isRightMenuOpen={rightMenuIsOpen} $top={top}>
        <Group>
          {isVesselListMapButtonDisplayed && (
            <MenuItem>
              <VesselListMapButton />
            </MenuItem>
          )}
          {isVesselGroupMapButtonDisplayed && (
            <MenuItem>
              <VesselGroupMapButton />
            </MenuItem>
          )}
          {isSuperUser && isControlUnitListMapButtonDisplayed && (
            <MenuItem>
              <ControlUnitListMapButton />
            </MenuItem>
          )}
          {isSuperUser && isReportingMapButtonDisplayed && (
            <MenuItem>
              <ReportingMapButton />
            </MenuItem>
          )}
        </Group>

        {isVesselVisibilityMapButtonDisplayed && (
          <Group>
            <MenuItem>
              <MapSettingsButton />
            </MenuItem>
          </Group>
        )}

        <Group>
          {isAccountMapButtonDisplayed && (
            <MenuItem>
              <Account />
            </MenuItem>
          )}
          {isNewFeaturesMapButtonDisplayed && (
            <MenuItem>
              <NewFeatures />
            </MenuItem>
          )}
        </Group>
      </RightMenu>
    </>
  )
}

const Menu = styled.menu<{ $top: number }>`
  display: flex;
  flex-direction: column;
  pointer-events: none;
  position: absolute;
  row-gap: 32px;
  top: calc(${p => p.$top}px + 10px);
  z-index: 1;
`

const LeftMenu = styled(Menu)`
  bottom: 110px;
  height: calc(100vh - ${p => p.$top}px - 116px);
  justify-content: space-between;
  left: 10px;
  row-gap: 0;
`

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 32px;
`

const BottomSection = styled.div``

const RightMenu = styled(Menu)<{
  $hasSearchButton: boolean
  $isRightMenuOpen: boolean
}>`
  padding-top: ${p => (p.$hasSearchButton ? 120 : 72)}px;
  right: ${p => (p.$isRightMenuOpen ? 10 : 0)}px;
`

const VesselSidebarContainer = styled.div<{ $isReportingOpen: boolean; $top: number }>`
  height: 0;
  overflow: visible;
  position: absolute;
  right: ${p => (p.$isReportingOpen ? 8 : 0)}px;
  top: calc(${p => p.$top}px + 10px);
  transition: right 0.3s;
  width: 0;
  z-index: 1;
`

const TopBar = styled.div<{
  $isRightMenuOpen: boolean
  $top: number
}>`
  align-items: center;
  display: flex;
  gap: 4px;
  position: absolute;
  right: ${p => (p.$isRightMenuOpen ? 10 : 0)}px;
  top: calc(${p => p.$top}px + 10px);
  transition: right 0.3s;
  z-index: 1;
`

const MenuItem = styled.li`
  align-items: center;
  display: flex;
  gap: 4px;
  pointer-events: auto;
  position: relative;
`

const Group = styled.ul`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`
export { VesselSearchButton } from './VesselSearchButton'
