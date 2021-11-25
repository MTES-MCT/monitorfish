import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import LastControlZone from './LastControlZone'
import ControlsResumeZone from './ControlsResumeZone'
import YearsToControlList from './YearsToControlList'
import { getYearsToControl, lastControlByType } from '../../../domain/entities/controls'
import getControls from '../../../domain/use_cases/getControls'
import {
  resetNextControlResumeAndControls,
  setControlFromDate,
  setControlResumeAndControls
} from '../../../domain/shared_slices/Control'
import { useDispatch, useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'

const VesselControls = () => {
  const dispatch = useDispatch()

  const {
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    /** @type {ControlResume} controlResumeAndControls */
    controlResumeAndControls,
    /** @type {ControlResume} nextControlResumeAndControls */
    nextControlResumeAndControls,
    controlsFromDate,
    loadingControls
  } = useSelector(state => state.controls)

  /** @type {Object.<string, VesselControl[]>} yearsToControls */
  const yearsToControls = useMemo(() => {
    let nextYearsToControls
    if (controlResumeAndControls?.controls) {
      nextYearsToControls = getYearsToControl(controlsFromDate, controlResumeAndControls.controls)
    }
    return nextYearsToControls
  }, [controlResumeAndControls, controlsFromDate])

  /** @type {LastControls} lastControlList */
  const lastControlList = useMemo(() => {
    let lastControlListByType
    if (controlResumeAndControls?.controls) {
      lastControlListByType = lastControlByType(yearsToControls)
    }
    return lastControlListByType
  }, [yearsToControls])

  useEffect(() => {
    if (controlsFromDate) {
      dispatch(getControls(true))
    }
  }, [selectedVessel, controlsFromDate])

  const updateControlResumeAndControls = nextControlResumeAndControls => {
    if (nextControlResumeAndControls) {
      dispatch(setControlResumeAndControls(nextControlResumeAndControls))
      dispatch(resetNextControlResumeAndControls())
    }
  }

  function seeMore () {
    const nextDate = new Date(controlsFromDate.getTime())
    nextDate.setMonth(nextDate.getMonth() - 12)

    dispatch(setControlFromDate(nextDate))
  }

  return <>
    {nextControlResumeAndControls && <>
      <UpdateControls/>
      <UpdateControlsButton
        onClick={() => updateControlResumeAndControls(nextControlResumeAndControls)}>
        Nouveaux contrôles
      </UpdateControlsButton>
    </>
    }
    {
      !loadingControls
        ? <Body data-cy={'vessel-controls'}>
          <ControlsResumeZone controlsFromDate={controlsFromDate} resume={controlResumeAndControls}/>
          <LastControlZone lastControlList={lastControlList} controlsFromDate={controlsFromDate}/>
          <YearsToControlList yearsToControls={yearsToControls} controlsFromDate={controlsFromDate}/>
          <SeeMoreBackground>
            <SeeMore onClick={seeMore}>
              Afficher plus de contrôles
            </SeeMore>
          </SeeMoreBackground>
        </Body>
        : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
    }
  </>
}

const SeeMoreBackground = styled.div`
  background: ${COLORS.background};
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
  background: ${COLORS.background};
`

const UpdateControls = styled.div`
  background: ${COLORS.background};
  position: absolute;
  opacity: 0.7;
  position: absolute;
  width: -moz-available;
  width: -webkit-fill-available;
  height: 55px;
  box-shadow: -10px 5px 7px 0px rgba(81,81,81, 0.2);
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
    -webkit-box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
  }
  70% {
      -webkit-box-shadow: 0 0 0 10px rgba(81,81,81, 0);
  }
  100% {
      -webkit-box-shadow: 0 0 0 0 rgba(81,81,81, 0);
  }
}
@keyframes pulse {
  0% {
    -moz-box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
    box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
  }
  70% {
      -moz-box-shadow: 0 0 0 10px rgba(81,81,81, 0);
      box-shadow: 0 0 0 10px rgba(81,81,81, 0);
  }
  100% {
      -moz-box-shadow: 0 0 0 0 rgba(81,81,81, 0);
      box-shadow: 0 0 0 0 rgba(81,81,81, 0);
  }
}
`

const Body = styled.div`
  padding: 0 5px 1px 5px;
  overflow-x: hidden;
  max-height: 730px;
`

export default VesselControls
