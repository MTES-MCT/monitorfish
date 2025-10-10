import { BannerStack } from '@features/MainWindow/components/BannerStack'
import { MainMap } from '@features/Map/components/MainMap'
import { SideWindowStatus } from '@features/SideWindow/constants'
import { VesselFiltersHeadband } from '@features/Vessel/components/VesselFiltersHeadband'
import { VesselGroupMainWindowEdition } from '@features/VesselGroup/components/VesselGroupMainWindowEdition'
import { trackEvent } from '@hooks/useTracking'
import { useCallback, useEffect } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import styled from 'styled-components'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { PreviewFilteredVessels } from './components/PreviewFilteredVessels'
import { APIWorker } from '../../api/APIWorker'
import { useIsSuperUser } from '../../auth/hooks/useIsSuperUser'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { ControlUnitDialog } from '../ControlUnit/components/ControlUnitDialog'
import { DrawLayerModal } from '../Draw/components/DrawModal'
import { HealthcheckHeadband } from '../Healthcheck/components/HealthcheckHeadband'
import { MapButtons } from '../Map/components/MapButtons'
import { SideWindowLauncher } from '../SideWindow/SideWindowLauncher'
import { VesselLoader } from '../Vessel/components/VesselLoader'

export function MainWindow() {
  const isControlUnitDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitDialogDisplayed
  )
  const isSuperUser = useIsSuperUser()
  const isDrawLayerModalDisplayed = useMainAppSelector(state => state.displayedComponent.isDrawLayerModalDisplayed)
  const isDraftDirty = useMainAppSelector(state => state.missionForm.isDraftDirty)
  const status = useMainAppSelector(state => state.sideWindow.status)

  useEffect(() => {
    trackEvent({
      action: `Visite`,
      category: 'VISIT',
      name: isSuperUser ? 'CNSP' : 'EXT'
    })
  }, [isSuperUser])

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
        <VesselFiltersHeadband />

        <LegacyRsuiteComponentsWrapper>
          <MapButtons />
        </LegacyRsuiteComponentsWrapper>

        <MainMap />

        {isControlUnitDialogDisplayed && <ControlUnitDialog />}

        <VesselLoader />
        <APIWorker />

        {status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
        {isDrawLayerModalDisplayed && <DrawLayerModal />}
        <VesselGroupMainWindowEdition />
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
`
