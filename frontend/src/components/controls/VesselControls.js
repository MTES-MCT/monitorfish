import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import LastControlZone from './LastControlZone'
import ControlsResumeZone from './ControlsResumeZone'
import YearsToControlList from './YearsToControlList'
import { controlType } from '../../domain/entities/controls'

const VesselControls = props => {
  const [yearsToControls, setYearsToControls] = useState({})
  const [lastControls, setLastControls] = useState([])

  const {
    controlResumeAndControls,
    nextControlResumeAndControls,
    controlsFromDate
  } = props

  const {
    controls
  } = controlResumeAndControls

  const lastControlType = (yearsToControls) => {
    const lastControlList = []
    let i = 0
    const sortedLastYearControlList = Object.values(yearsToControls).flat()
      .sort((a, b) => a.controlDatetimeUtc > b.controlDatetimeUtc)
    while (i < sortedLastYearControlList.length && lastControlList.length < 2) {
      console.log(sortedLastYearControlList[i])
      if (sortedLastYearControlList[i].controlType === controlType.SEA) {
        lastControlList.push(sortedLastYearControlList[i])
      } else if (sortedLastYearControlList[i].controlType === controlType.LAND) {
        lastControlList.push(sortedLastYearControlList[i])
      }
      i++
    }
    return lastControlList
  }

  useEffect(() => {
    if (controlResumeAndControls && controlResumeAndControls.controls && controls.length) {
      const nextYearsToControls = {}

      if (controlsFromDate) {
        let fromYear = controlsFromDate.getUTCFullYear() + 1
        while (fromYear < new Date().getUTCFullYear()) {
          nextYearsToControls[fromYear] = []
          fromYear += 1
        }
      }

      controls.forEach(control => {
        if (control && control.controlDatetimeUtc) {
          const year = new Date(control.controlDatetimeUtc).getUTCFullYear()

          if (nextYearsToControls[year] && nextYearsToControls[year].length) {
            nextYearsToControls[year] = nextYearsToControls[year].concat(control)
          } else {
            nextYearsToControls[year] = [control]
          }
        }
      })
      const lastControls = lastControlType(nextYearsToControls)
      setYearsToControls(nextYearsToControls)
      setLastControls(lastControls)
    } else {
      setYearsToControls(null)
    }
  }, [controlResumeAndControls])

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
          controlResumeAndControls && <Body>
            <ControlsResumeZone controlsFromDate={controlsFromDate} resume={controlResumeAndControls} />
            <LastControlZone lastControlList={lastControls} />
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
