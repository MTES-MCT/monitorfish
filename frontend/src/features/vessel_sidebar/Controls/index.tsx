import { useCallback, useEffect, useMemo } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { ControlsSummary } from './ControlsSummary'
import { YearsToControlList } from './YearsToControlList'
import { COLORS } from '../../../constants/constants'
import { getLastControls, getYearsToActions } from '../../../domain/entities/controls'
import { resetNextControlSummary, setControlFromDate, setControlSummary } from '../../../domain/shared_slices/Control'
import { INITIAL_LAST_CONTROLS } from '../../../domain/types/missionAction'
import { getVesselMissionActions } from '../../../domain/use_cases/missions/getVesselMissionActions'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

export function Controls() {
  const dispatch = useMainAppDispatch()

  const { selectedVessel } = useMainAppSelector(state => state.vessel)

  const { controlsFromDate, currentControlSummary, loadingControls, nextControlSummary } = useMainAppSelector(
    state => state.controls
  )

  const yearsToActions = useMemo(() => {
    if (!currentControlSummary?.controls) {
      return {}
    }

    return getYearsToActions(controlsFromDate, currentControlSummary.controls)
  }, [currentControlSummary, controlsFromDate])

  const lastControls = useMemo(() => {
    if (!currentControlSummary?.controls) {
      return INITIAL_LAST_CONTROLS
    }

    return getLastControls(yearsToActions)
  }, [yearsToActions, currentControlSummary?.controls])

  useEffect(() => {
    if (!controlsFromDate) {
      return
    }

    dispatch(getVesselMissionActions(true) as any)
  }, [dispatch, selectedVessel, controlsFromDate])

  const updateControlSummary = nextControlSummary_ => {
    if (nextControlSummary_) {
      dispatch(setControlSummary(nextControlSummary_))
      dispatch(resetNextControlSummary())
    }
  }

  const seeMore = useCallback(() => {
    const nextDate = new Date(controlsFromDate.getTime())
    nextDate.setMonth(nextDate.getMonth() - 12)

    dispatch(setControlFromDate(nextDate))
  }, [dispatch, controlsFromDate])

  return (
    <>
      {nextControlSummary && (
        <>
          <UpdateControls />
          <UpdateControlsButton onClick={() => updateControlSummary(nextControlSummary)}>
            Nouveaux contrôles
          </UpdateControlsButton>
        </>
      )}
      {!loadingControls ? (
        <Body data-cy="vessel-controls">
          {currentControlSummary && (
            <ControlsSummary
              controlsFromDate={controlsFromDate}
              lastControls={lastControls}
              summary={currentControlSummary}
            />
          )}
          <YearsToControlList controlsFromDate={controlsFromDate} yearsToControls={yearsToActions} />
          <SeeMoreBackground>
            <SeeMore onClick={seeMore}>Afficher plus de contrôles</SeeMore>
          </SeeMoreBackground>
        </Body>
      ) : (
        <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
      )}
    </>
  )
}

const SeeMoreBackground = styled.div`
  background: ${COLORS.white};
  margin: 0px 5px 10px 5px;
  padding: 5px 0 5px 0;
`

const SeeMore = styled.div`
  border: 1px solid ${COLORS.charcoal};
  color: ${COLORS.gunMetal};
  padding: 5px 10px 5px 10px;
  width: max-content;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
  background: ${COLORS.white};
`

const UpdateControls = styled.div`
  background: ${COLORS.white};
  position: absolute;
  opacity: 0.7;
  position: absolute;
  width: -moz-available;
  width: -webkit-fill-available;
  height: 55px;
  box-shadow: -10px 5px 7px 0px rgba(81, 81, 81, 0.2);
  z-index: 9;
`

const UpdateControlsButton = styled.div`
  background: ${COLORS.charcoal};
  border-radius: 15px;
  font-size: 13px;
  color: ${COLORS.gainsboro};
  position: absolute;
  padding: 5px 10px 5px 10px;
  margin-top: 13px;
  margin-left: 166px;
  cursor: pointer;
  animation: pulse 2s infinite;
  z-index: 10;

  @-webkit-keyframes pulse {
    0% {
      -webkit-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
    }
    70% {
      -webkit-box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
    }
    100% {
      -webkit-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
    }
  }
  @keyframes pulse {
    0% {
      -moz-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
      box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
    }
    70% {
      -moz-box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
      box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
    }
    100% {
      -moz-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
      box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
    }
  }
`

const Body = styled.div`
  padding: 0 5px 1px 5px;
  overflow-x: hidden;
  max-height: 700px;
`
