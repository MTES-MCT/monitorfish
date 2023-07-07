import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { VesselBeaconMalfunctions } from './beacon_malfunctions/VesselBeaconMalfunctions'
import { Controls } from './Controls'
import { VesselFishingActivities } from './fishing_activities/VesselFishingActivities'
import { Identity } from './Identity'
import { Reportings } from './Reportings'
import { VesselSummary } from './Summary'
import { AlertWarning } from './warnings/AlertWarning'
import { BeaconMalfunctionWarning } from './warnings/BeaconMalfunctionWarning'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'
import { useIsSuperUser } from '../../hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function Body() {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning } = useMainAppSelector(state => state.global)
  const { vesselSidebarError } = useMainAppSelector(state => state.displayedError)
  const { selectedVessel, vesselSidebarTab } = useMainAppSelector(state => state.vessel)

  if (vesselSidebarError) {
    return (
      <ErrorFallback data-cy="vessel-sidebar-error">
        🔌 {vesselSidebarError.message}
        <br />
        <RetryButton
          accent={Accent.PRIMARY}
          onClick={() => {
            const parameters = vesselSidebarError.useCase?.parameters
            if (!parameters) {
              return dispatch(vesselSidebarError.useCase?.func())
            }

            return dispatch(vesselSidebarError.useCase?.func(...parameters))
          }}
        >
          Réessayer
        </RetryButton>
      </ErrorFallback>
    )
  }

  return (
    <Wrapper healthcheckTextWarning={healthcheckTextWarning}>
      {isSuperUser && <AlertWarning selectedVessel={selectedVessel} />}
      {isSuperUser && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY && <Identity />}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselFishingActivities />}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS && <Controls />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.REPORTING && <Reportings />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselBeaconMalfunctions />}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  healthcheckTextWarning: string | undefined
}>`
  padding: 0;
  background: ${p => p.theme.color.gainsboro};
  max-height: ${p => (p.healthcheckTextWarning ? 80 : 82)}vh;
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
