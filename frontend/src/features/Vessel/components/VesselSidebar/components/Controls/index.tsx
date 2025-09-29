import { SidebarLoadMoreYears } from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { getVesselControls } from '@features/Vessel/components/VesselSidebar/useCases/getVesselControls'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, FingerprintLoader, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

import { ControlsSummary } from './ControlsSummary'
import { YearsToControlList } from './YearsToControlList'
import { getLastControls, getYearsToActions, INITIAL_LAST_CONTROLS } from '../../../../../../domain/entities/controls'
import { setControlFromDate } from '../../control.slice'

export function VesselControls() {
  const dispatch = useMainAppDispatch()

  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  assertNotNullish(selectedVesselIdentity)

  const controlsFromDate = useMainAppSelector(state => state.controls.controlsFromDate)
  const currentControlSummary = useMainAppSelector(state => state.controls.currentControlSummary)
  const isLoadingControls = useMainAppSelector(state => state.controls.isLoadingControls)

  const hasNoControl = !!selectedVesselIdentity && !selectedVesselIdentity?.vesselId

  const yearsToActions = (function () {
    if (!currentControlSummary?.controls) {
      return {}
    }

    return getYearsToActions(controlsFromDate, currentControlSummary.controls)
  })()

  const lastControls = (function () {
    if (!currentControlSummary?.controls) {
      return INITIAL_LAST_CONTROLS
    }

    return getLastControls(yearsToActions)
  })()

  const seeMore = async () => {
    const nextDate = customDayjs(controlsFromDate).subtract(1, 'year').toISOString()

    await dispatch(setControlFromDate(nextDate))
    dispatch(getVesselControls(selectedVesselIdentity))
  }

  if (hasNoControl) {
    return <NoControl data-cy="vessel-controls">Nous n’avons trouvé aucun contrôle pour ce navire.</NoControl>
  }

  if (isLoadingControls) {
    return <FingerprintLoader className="radar" color={THEME.color.charcoal} />
  }

  return (
    <>
      <Body data-cy="vessel-controls">
        {currentControlSummary && (
          <ControlsSummary
            controlsFromDate={controlsFromDate}
            lastControls={lastControls}
            summary={currentControlSummary}
          />
        )}
        <>
          <YearsToControlList controlsFromDate={controlsFromDate} yearsToControls={yearsToActions} />
          <SidebarLoadMoreYears>
            <Button accent={Accent.SECONDARY} onClick={seeMore}>
              Afficher plus de contrôles
            </Button>
          </SidebarLoadMoreYears>
        </>
      </Body>
    </>
  )
}

const NoControl = styled.div`
  padding: 50px 5px 0 5px;
  margin: 10px 10px;
  height: 70px;
  background: ${p => p.theme.color.white};
  color: #ff3392;
  text-align: center;
`

const Body = styled.div`
  padding: 0 10px 10px 10px;
`
