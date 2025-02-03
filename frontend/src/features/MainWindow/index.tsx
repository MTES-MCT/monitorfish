import { BannerStack } from '@features/MainWindow/components/BannerStack'
import { MainMap } from '@features/Map/components/MainMap'
import { useCallback } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import styled from 'styled-components'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

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
import PreviewFilteredVessels from './components/PreviewFilteredVessels'
import { SideWindowLauncher } from '../SideWindow/SideWindowLauncher'
import { VesselList } from '../Vessel/components/VesselList'
import { VesselLoader } from '../Vessel/components/VesselLoader'
import { VesselSidebar } from '../Vessel/components/VesselSidebar'
import { VesselSidebarHeader } from '../Vessel/components/VesselSidebar/VesselSidebarHeader'

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
        <BannerStack />
        <MainMap />

        <LegacyRsuiteComponentsWrapper>
          <LayersSidebar />
          {isVesselSearchDisplayed && <VesselSidebarHeader />}
          <MapButtons />
          <RightMenuOnHoverArea />
          {isVesselListDisplayed && <VesselList />}
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
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  width: 100vw;
`
