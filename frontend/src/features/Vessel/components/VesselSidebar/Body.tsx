import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedError } from '@libs/DisplayedError'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { VesselControls } from './Controls'
import { VesselEquipment } from './Equipment/VesselEquipment'
import { VesselSummary } from './Summary'
import { VesselIdentity } from './VesselIdentity'
import { AlertWarning } from './warnings/AlertWarning'
import { BeaconMalfunctionWarning } from './warnings/BeaconMalfunctionWarning'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { VesselSidebarTab } from '../../../../domain/entities/vessel/vessel'
import { VesselLogbook } from '../../../Logbook/components/VesselLogbook'
import { VesselReportings } from '../../../Reporting/components/VesselReportings'

export function Body() {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const vesselSidebarError = useMainAppSelector(state => state.displayedError.vesselSidebarError)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselSidebarTab = useMainAppSelector(state => state.vessel.selectedVesselSidebarTab)

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
    <>
      {isSuperUser && selectedVessel && <AlertWarning selectedVessel={selectedVessel} />}
      {isSuperUser && selectedVessel && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      <Wrapper $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
        {selectedVesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
        {selectedVesselSidebarTab === VesselSidebarTab.IDENTITY && <VesselIdentity />}
        {selectedVesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselLogbook />}
        {selectedVesselSidebarTab === VesselSidebarTab.CONTROLS && <VesselControls />}
        {isSuperUser && selectedVesselSidebarTab === VesselSidebarTab.REPORTING && <VesselReportings />}
        {selectedVesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselEquipment />}
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div<{
  $hasHealthcheckTextWarning: boolean
}>`
  padding: 0;
  background: ${p => p.theme.color.gainsboro};
  max-height: ${p => (p.$hasHealthcheckTextWarning ? 74 : 76)}vh;
  overflow-x: hidden;
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
