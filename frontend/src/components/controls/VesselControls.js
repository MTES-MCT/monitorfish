import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import LastControlZone from './LastControlZone'
import ControlsResumeZone from './ControlsResumeZone'
import YearsToControlList from './YearsToControlList'
import { lastControlByType, getYearsToControl } from '../../domain/entities/controls'

const VesselControls = props => {
  const [yearsToControls, setYearsToControls] = useState()
  const [lastControlList, setLastControlList] = useState()

  const {
    controlResumeAndControls,
    nextControlResumeAndControls,
    controlsFromDate
  } = props

  const {
    controls
  } = controlResumeAndControls

  useEffect(() => {
    if (controlResumeAndControls && controlResumeAndControls.controls && controls.length) {
      const nextYearsToControls = getYearsToControl(controlsFromDate, controls)
      const lastControl = lastControlByType(nextYearsToControls)
      setYearsToControls(nextYearsToControls)
      setLastControlList(lastControl)
    } else {
      setYearsToControls(undefined)
      setLastControlList(undefined)
    }
  }, [controlResumeAndControls, controlsFromDate, controls, setYearsToControls, setLastControlList])

  return <>
        { nextControlResumeAndControls && <>
                <UpdateControls/>
                <UpdateControlsButton
                    onClick={() => props.updateControlResumeAndControls(nextControlResumeAndControls)}>
                    Nouveaux contrôles
                </UpdateControlsButton>
            </>
        }
        {
          controlResumeAndControls && lastControlList && yearsToControls
            ? <Body>
                <ControlsResumeZone controlsFromDate={controlsFromDate} resume={controlResumeAndControls} />
                <LastControlZone lastControlList={lastControlList} />
                <YearsToControlList yearsToControls={yearsToControls} controlsFromDate={controlsFromDate} />
                <SeeMoreBackground>
                    <SeeMore onClick={() => {
                      const nextDate = new Date(controlsFromDate.getTime())
                      nextDate.setMonth(nextDate.getMonth() - 12)

                      props.setControlFromDate(nextDate)
                    }}>
                        Afficher plus de contrôles
                    </SeeMore>
                </SeeMoreBackground>
              </Body>
            : null
        }
        </>
}

const SeeMoreBackground = styled.div`
  background: ${COLORS.background};
  margin: 0px 5px 10px 5px;
  padding: 5px 0 5px 0;
`

const SeeMore = styled.div`
  border: 1px solid ${COLORS.grayDarkerThree};
  color: ${COLORS.grayDarkerThree};
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
  background: ${COLORS.grayDarkerThree};
  border-radius: 15px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
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
`

export default VesselControls
