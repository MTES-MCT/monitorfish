import { useCallback, useEffect, useMemo } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getYearsToControl, lastControlByType } from '../../../domain/entities/controls'
import { resetNextControlSummary, setControlFromDate, setControlSummary } from '../../../domain/shared_slices/Control'
import { getVesselControls } from '../../../domain/use_cases/vessel/getVesselControls'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import ControlsResumeZone from './ControlsResumeZone'
import LastControlZone from './LastControlZone'
import { YearsToControlList } from './YearsToControlList'

export function VesselControls() {
  const dispatch = useAppDispatch()

  const { selectedVessel } = useAppSelector(state => state.vessel)

  const { controlsFromDate, currentControlSummary, loadingControls, nextControlSummary } = useAppSelector(
    state => state.controls
  )

  /** @type {Object.<string, VesselControl[]>} yearsToControls */
  const yearsToControls = useMemo(() => {
    if (!currentControlSummary?.controls) {
      return {}
    }

    return getYearsToControl(controlsFromDate, currentControlSummary.controls)
  }, [currentControlSummary, controlsFromDate])

  /** @type {LastControls} lastControlList */
  const lastControlList = useMemo(() => {
    let lastControlListByType
    if (currentControlSummary?.controls) {
      lastControlListByType = lastControlByType(yearsToControls)
    }

    return lastControlListByType
  }, [yearsToControls, currentControlSummary?.controls])

  useEffect(() => {
    if (!controlsFromDate) {
      return
    }

    dispatch(getVesselControls(true) as any)
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
          <ControlsResumeZone controlsFromDate={controlsFromDate} resume={currentControlSummary} />
          <LastControlZone controlsFromDate={controlsFromDate} lastControlList={lastControlList} />
          <YearsToControlList controlsFromDate={controlsFromDate} yearsToControls={yearsToControls} />
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
