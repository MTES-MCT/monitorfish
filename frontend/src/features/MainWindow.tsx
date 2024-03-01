import { useCallback } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import styled from 'styled-components'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { ErrorToastNotification } from './commonComponents/ErrorToastNotification'
import { ControlUnitDialog } from './ControlUnit/components/ControlUnitDialog'
import { ControlUnitListDialog } from './ControlUnit/components/ControlUnitListDialog'
import { HealthcheckHeadband } from './Healthcheck/components/HealthcheckHeadband'
import { LayersSidebar } from './LayersSidebar/components'
import { DrawLayerModal } from './map/draw/DrawModal'
import { Map } from './map/Map'
import { MapButtons } from './MapButtons'
import { RightMenuOnHoverArea } from './MapButtons/shared/RightMenuOnHoverArea'
import PreviewFilteredVessels from './preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindowLauncher } from './SideWindow/SideWindowLauncher'
import { VesselLoader } from './Vessel/components/VesselLoader'
import { VesselList } from './VesselList'
import { VesselSidebar } from './VesselSidebar'
import { VesselSidebarHeader } from './VesselSidebar/VesselSidebarHeader'
import { APIWorker } from '../api/APIWorker'
import { Notifier } from '../components/Notifier'
import { SideWindowStatus } from '../domain/entities/sideWindow/constants'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

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
    <>
      <HealthcheckHeadband />

      <PreviewFilteredVessels />

      <Wrapper id="mainWindowWrapper">
        <Map />

        <LegacyRsuiteComponentsWrapper>
          <LayersSidebar />
          {isVesselSearchDisplayed && <VesselSidebarHeader />}
          <MapButtons />
          <RightMenuOnHoverArea />
          {isVesselListDisplayed && <VesselList namespace="homepage" />}
          {isVesselSidebarOpen && <VesselSidebar />}
        </LegacyRsuiteComponentsWrapper>

        {isControlUnitDialogDisplayed && <ControlUnitDialog />}
        {isControlUnitListDialogDisplayed && <ControlUnitListDialog />}

        <VesselLoader />
        <APIWorker />
        <ErrorToastNotification />
        <Notifier />

        {status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
        {isDrawLayerModalDisplayed && <DrawLayerModal />}
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  width: 100vw;
`
