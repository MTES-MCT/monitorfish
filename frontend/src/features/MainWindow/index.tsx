import { EnvironmentBox, getEnvironmentBorderStyle } from '@components/EnvironmentBox'
import { BannerStack } from '@features/MainWindow/components/BannerStack'
import { MainMap } from '@features/Map/components/MainMap'
import { IUUReportingMapForm } from '@features/Reporting/components/IUUReportingMapForm'
import { SideWindowStatus } from '@features/SideWindow/constants'
import { VesselFiltersHeadband } from '@features/Vessel/components/VesselFiltersHeadband'
import { VesselGroupMainWindowEdition } from '@features/VesselGroup/components/VesselGroupMainWindowEdition'
import { trackEvent } from '@hooks/useTracking'
import { getEnvironmentData } from '@utils/getEnvironmentData'
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

const { isEnvironmentBoxVisible } = getEnvironmentData()

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

      <Wrapper $isEnvironmentBoxVisible={isEnvironmentBoxVisible} id="mainWindowWrapper">
        <EnvironmentBox />
        <BannerStack />

        <VesselFiltersHeadband />

        <LegacyRsuiteComponentsWrapper>
          <MapButtons />
        </LegacyRsuiteComponentsWrapper>

        <MainMap />

        {isControlUnitDialogDisplayed && <ControlUnitDialog />}

        <VesselLoader />
        <APIWorker />

        <IUUReportingMapForm />
        {status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
        {isDrawLayerModalDisplayed && <DrawLayerModal />}
        <VesselGroupMainWindowEdition />
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div<{
  $isEnvironmentBoxVisible: boolean
}>`
  ${p => getEnvironmentBorderStyle(p.$isEnvironmentBoxVisible)}
  font-size: 13px;
  overflow: hidden;
  width: ${p => (p.$isEnvironmentBoxVisible ? 'calc(100% - 8px)' : '100%')};
  height: ${p => (p.$isEnvironmentBoxVisible ? 'calc(100% - 10px)' : '100%')};
`
