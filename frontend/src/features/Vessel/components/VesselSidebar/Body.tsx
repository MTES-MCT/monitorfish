import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedError } from '@libs/DisplayedError'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Controls } from './Controls'
import { VesselEquipment } from './Equipment/VesselEquipment'
import { Identity } from './Identity'
import { VesselSummary } from './Summary'
import { VesselReportingList } from './VesselReportingList'
import { AlertWarning } from './warnings/AlertWarning'
import { BeaconMalfunctionWarning } from './warnings/BeaconMalfunctionWarning'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { VesselSidebarTab } from '../../../../domain/entities/vessel/vessel'
import { VesselLogbook } from '../../../Logbook/components/VesselLogbook'

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
    <Wrapper $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
      {isSuperUser && selectedVessel && <AlertWarning selectedVessel={selectedVessel} />}
      {isSuperUser && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {selectedVesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {selectedVesselSidebarTab === VesselSidebarTab.IDENTITY && <Identity />}
      {selectedVesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselLogbook />}
      {selectedVesselSidebarTab === VesselSidebarTab.CONTROLS && <Controls />}
      {isSuperUser && selectedVesselSidebarTab === VesselSidebarTab.REPORTING && <VesselReportingList />}
      {selectedVesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselEquipment />}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $hasHealthcheckTextWarning: boolean
}>`
  padding: 0;
  background: ${p => p.theme.color.gainsboro};
  max-height: ${p => (p.$hasHealthcheckTextWarning ? 80 : 82)}vh;
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
