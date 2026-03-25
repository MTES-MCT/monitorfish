import { Account } from '@features/Account/components/Account'
import { ActivityVisualizationMapButton } from '@features/ActivityVisualization/components/ActivityVisualizationMapButton'
import { ControlUnitListMapButton } from '@features/ControlUnit/components/ControlUnitListMapButton'
import { LayersSidebar } from '@features/LayersSidebar/components'
import { RightMenuOnHoverArea } from '@features/Map/components/MapButtons/shared/RightMenuOnHoverArea'
import { NewFeatures } from '@features/NewFeatures/components/NewFeatures'
import { ReportingMapButton } from '@features/Reporting/components/ReportingMapButton'
import { VesselListMapButton } from '@features/Vessel/components/VesselListMapButton'
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
      <RightMenu $top={top}>
        <Group>
          <MenuItem>
            {isVesselSearchDisplayed && <VesselSidebarHeader />}
            {isVesselSidebarOpen && <VesselSidebar />}
          </MenuItem>
        </Group>
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

const RightMenu = styled(Menu)`
  right: 10px;
`

const MenuItem = styled.li`
  position: relative;
  display: flex;
`

const Group = styled.ul`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`
