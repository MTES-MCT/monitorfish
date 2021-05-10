import React, { useEffect, useRef, useState } from 'react'
import TrackDepthRadio from './TrackDepthRadio'
import TrackDepthDateRange from './TrackDepthDateRange'
import { COLORS } from '../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as ClockSVG } from '../icons/Bouton_regler_piste_navire.svg'
import { VesselTrackDepth } from '../../domain/entities/vesselTrackDepth'

const TrackDepthSelection = props => {
  const [datesSelection, setDateSelection] = useState([])
  const [trackDepthRadioSelection, setTrackDepthRadioSelection] = useState(null)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setDateSelection([])
    setTrackDepthRadioSelection(props.vesselTrackDepth)
  }, [props.init])

  useEffect(() => {
    if (props.vesselTrackDepth && !trackDepthRadioSelection) {
      setTrackDepthRadioSelection(props.vesselTrackDepth)
    }
  }, [props.vesselTrackDepth])

  useEffect(() => {
    if (trackDepthRadioSelection) {
      if (firstUpdate.current) {
        firstUpdate.current = false
        return
      }

      props.showVesselTrackWithTrackDepth(trackDepthRadioSelection, null, null)
      setDateSelection([])
    }
  }, [trackDepthRadioSelection])

  const convertToUTCDay = datesSelection => {
    datesSelection[0].setMinutes(datesSelection[0].getMinutes() - datesSelection[0].getTimezoneOffset())
    datesSelection[1].setMinutes(datesSelection[1].getMinutes() - datesSelection[1].getTimezoneOffset())
  }

  useEffect(() => {
    if (datesSelection && datesSelection.length > 1) {
      if (firstUpdate.current) {
        firstUpdate.current = false
        return
      }

      convertToUTCDay(datesSelection)
      props.showVesselTrackWithTrackDepth(VesselTrackDepth.CUSTOM, datesSelection[0], datesSelection[1])
      setTrackDepthRadioSelection(null)
    } else if (!trackDepthRadioSelection) {
      setTrackDepthRadioSelection(props.vesselTrackDepth)
    }
  }, [datesSelection])

  return (
      <>
          <TrackDepthSelectionButton
            openBox={props.openBox}
            firstUpdate={firstUpdate.current}
            rightMenuIsOpen={props.rightMenuIsOpen}
            trackDepthSelectionIsOpen={props.trackDepthSelectionIsOpen}
            onClick={() => props.setTrackDepthSelectionIsOpen(!props.trackDepthSelectionIsOpen)}
          >
              <ClockIcon />
          </TrackDepthSelectionButton>
          <TrackDepthSelectionContent
            openBox={props.openBox}
            firstUpdate={firstUpdate.current}
            rightMenuIsOpen={props.rightMenuIsOpen}
            trackDepthSelectionIsOpen={props.trackDepthSelectionIsOpen}
          >
              Afficher la piste VMS du navire depuis :
              <TrackDepthRadio
                vesselTrackDepth={props.vesselTrackDepth}
                showVesselTrackWithTrackDepth={props.showVesselTrackWithTrackDepth}
                trackDepthRadioSelection={trackDepthRadioSelection}
                setTrackDepthRadioSelection={setTrackDepthRadioSelection}
              />
              <TrackDepthDateRange
                dates={datesSelection}
                setDate={setDateSelection}
              />
          </TrackDepthSelectionContent>
      </>
  )
}

const TrackDepthSelectionButton = styled.div`
  top: 118px;
  height: 30px;
  width: 30px;
  background: ${props => props.trackDepthSelectionIsOpen ? COLORS.textGray : COLORS.grayBackground};
  position: absolute;
  right: 10px;
  margin-right: -45px;
  opacity: 0;
  cursor: pointer;
  border-radius: 1px;
  z-index: 999;
  
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'vessel-track-depth-selection-button-opening' : 'vessel-track-depth-selection-button-closing'} 0.5s ease forwards,
  ${props => props.rightMenuIsOpen && props.openBox ? 'vessel-box-opening-with-right-menu-hover' : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  @keyframes vessel-track-depth-selection-button-opening {
    0%   { margin-right: -45px; opacity: 0;   }
    100% { margin-right: 505px; opacity: 1; }
  }

  @keyframes vessel-track-depth-selection-button-closing {
    0% { margin-right: 505px; opacity: 1; }
    100%   { margin-right: -45px; opacity: 0;   }
  }
`

const TrackDepthSelectionContent = styled.div`
  top: 118px;
  height: 155px;
  width: 282px;
  background: ${COLORS.background};
  position: absolute;
  right: 10px;
  margin-right: ${props => !props.firstUpdate && props.openBox && props.trackDepthSelectionIsOpen ? '540px' : '217px'};
  opacity: ${props => !props.firstUpdate && props.openBox && props.trackDepthSelectionIsOpen ? '1' : '0'};
  visibility: ${props => !props.firstUpdate && props.openBox && props.trackDepthSelectionIsOpen ? 'visible' : 'hidden'};
  border-radius: 2px;
  padding: 15px 0 15px 0;
  font-size: 13px;
  color: ${COLORS.textGray};
  transition: all 0.3s;

  animation: ${props => props.rightMenuIsOpen && props.openBox && props.trackDepthSelectionIsOpen ? 'vessel-box-opening-with-right-menu-hover' : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  @keyframes vessel-track-depth-selection-opening {
    0%   { margin-right: 217px; opacity: 0; visibility: hidden; }
    100% { margin-right: 540px; opacity: 1; visibility: visible; }
  }

  @keyframes vessel-track-depth-selection-closing {
    0% { margin-right: 540px; opacity: 1; visibility: visible; }
    100%   { margin-right: 217px; opacity: 0; visibility: hidden;   }
  }
`

const ClockIcon = styled(ClockSVG)`
  width: 30px;
  background: none;
`

export default TrackDepthSelection
