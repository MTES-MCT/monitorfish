import { MissionMenuDialog } from '@features/Mission/components/MissionMenuDialog'
import { MapBox } from 'domain/entities/map/constants'
import { useCallback } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import styled from 'styled-components'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { LeftMenu } from './components/LeftMenu'
import { MapButtons } from './components/MapButtons'
import { APIWorker } from '../../api/APIWorker'
import { Notifier } from '../../components/Notifier'
import { RightMenuOnHoverArea } from './components/MapButtons/shared/RightMenuOnHoverArea'
import { SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { ErrorToastNotification } from '../commonComponents/ErrorToastNotification'
import { ControlUnitDialog } from '../ControlUnit/components/ControlUnitDialog'
import { ControlUnitListDialog } from '../ControlUnit/components/ControlUnitListDialog'
import { DrawLayerModal } from '../Draw/components/DrawModal'
import { HealthcheckHeadband } from '../Healthcheck/components/HealthcheckHeadband'
import { LayersSidebar } from '../LayersSidebar/components'
import { Map } from '../map/Map'
import PreviewFilteredVessels from '../preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindowLauncher } from '../SideWindow/SideWindowLauncher'
import { VesselLoader } from '../Vessel/components/VesselLoader'
import { VesselList } from '../VesselList'
import { VesselSidebar } from '../VesselSidebar'
import { VesselSidebarHeader } from '../VesselSidebar/VesselSidebarHeader'

export function MainWindow() {
  const isControlUnitDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitDialogDisplayed
  )
  const isControlUnitListDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListDialogDisplayed
  )
  const isDrawLayerModalDisplayed = useMainAppSelector(state => state.displayedComponent.isDrawLayerModalDisplayed)
  const isVesselListDisplayed = useMainAppSelector(state => state.displayedComponent.isVesselListDisplayed)
  const isVesselSearchDisplayed = useMainAppSelector(state => state.displayedComponent.isVesselSearchDisplayed)
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const isDraftDirty = useMainAppSelector(state => state.missionForm.isDraftDirty)
  const leftDialog = useMainAppSelector(state => state.mainWindow.leftDialog)
  const status = useMainAppSelector(state => state.sideWindow.status)

  const warnOnUnload = useCallback(
    event => {
      if (status !== SideWindowStatus.CLOSED && isDraftDirty) {
        event.preventDefault()

        // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#examples
        // eslint-disable-next-line no-param-reassign
        event.returnValue = ''
      }
    },
    [isDraftDirty, status]
  )

  useBeforeUnload(warnOnUnload)

  return (
    <Wrapper id="mainWindowWrapper">
      <HealthcheckHeadband />

      <MapWrapper>
        <PreviewFilteredVessels />

        <Map />

        <LeftMenu />

        <LegacyRsuiteComponentsWrapper>
          <LayersSidebar />
          {isVesselSearchDisplayed && <VesselSidebarHeader />}
          <MapButtons />
          <RightMenuOnHoverArea />
          {isVesselListDisplayed && <VesselList namespace="homepage" />}
        </LegacyRsuiteComponentsWrapper>
        {isVesselSidebarOpen && <VesselSidebar />}

        {isControlUnitDialogDisplayed && <ControlUnitDialog />}
        {isControlUnitListDialogDisplayed && <ControlUnitListDialog />}

        <VesselLoader />
        <APIWorker />
        <ErrorToastNotification />
        <Notifier />

        {status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
        {isDrawLayerModalDisplayed && <DrawLayerModal />}
      </MapWrapper>

      {leftDialog?.key === MapBox.MISSIONS && <MissionMenuDialog />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

const MapWrapper = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  font-size: 13px;
  overflow: hidden;
  position: relative;
`
