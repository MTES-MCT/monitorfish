import { DisplayedError } from '@libs/DisplayedError'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { VesselBeaconMalfunctions } from './beacon_malfunctions/VesselBeaconMalfunctions'
import { Controls } from './Controls'
import { Identity } from './Identity'
import { VesselSummary } from './Summary'
import { AlertWarning } from './warnings/AlertWarning'
import { BeaconMalfunctionWarning } from './warnings/BeaconMalfunctionWarning'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'
import { useIsSuperUser } from '../../hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { VesselLogbook } from '../Logbook/components/VesselLogbook'
import { VesselReportings } from '../Reporting/components/VesselReportings'

export function Body() {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const healthcheckTextWarning = useMainAppSelector(state => state.mainWindow.healthcheckTextWarning)
  const vesselSidebarError = useMainAppSelector(state => state.displayedError.vesselSidebarError)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const vesselSidebarTab = useMainAppSelector(state => state.vessel.vesselSidebarTab)

  const handleRetry = () => {
    DisplayedError.retryUseCase(dispatch, DisplayedErrorKey.VESSEL_SIDEBAR_ERROR)
  }

  if (vesselSidebarError) {
    return (
      <ErrorFallback data-cy="vessel-sidebar-error">
        🔌 {vesselSidebarError.message}
        <br />
        {vesselSidebarError.hasRetryableUseCase && (
          <RetryButton accent={Accent.PRIMARY} onClick={handleRetry}>
            Réessayer
          </RetryButton>
        )}
      </ErrorFallback>
    )
  }

  return (
    <Wrapper hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
      {isSuperUser && <AlertWarning selectedVessel={selectedVessel} />}
      {isSuperUser && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {vesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY && <Identity />}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselLogbook />}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS && <Controls />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.REPORTING && <VesselReportings />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselBeaconMalfunctions />}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  hasHealthcheckTextWarning: boolean
}>`
  padding: 0;
  background: ${p => p.theme.color.gainsboro};
  max-height: ${p => (p.hasHealthcheckTextWarning ? 80 : 82)}vh;
`

const ErrorFallback = styled.div`
  border: ${p => p.theme.color.gainsboro} 10px solid;
  padding-top: 30px;
  height: 90px;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  text-align: center;
`

const RetryButton = styled(Button)`
  margin-top: 10px;
`
