import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";

import {ReactComponent as VesselSVG} from '../components/icons/Icone_navire.svg';
import {COLORS} from "../constants/constants";
import LastPositionsSlider from "../components/LastPositionsSlider";
import {setVesselsLastPositionVisibility, setVesselTrackDepth} from "../domain/reducers/Map";
import TrackDepthRadio from "../components/TrackDepthRadio";

const VesselVisibility = () => {
    const dispatch = useDispatch()
    const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
    const vesselTrackDepth = useSelector(state => state.map.vesselTrackDepth)
    const firstUpdate = useRef(true);
    const [lastPositionsBoxIsOpen, setLastPositionsBoxIsOpen] = useState(false);

    useEffect(() => {
        if (lastPositionsBoxIsOpen === true) {
            firstUpdate.current = false;
        }
    }, [lastPositionsBoxIsOpen])

    const updateVesselsLastPositionVisibility = (hidden, opacityReduced) => {
        dispatch(setVesselsLastPositionVisibility({
            opacityReduced: opacityReduced,
            hidden: hidden
        }))
    }

    const updateVesselTrackDepth = (depth) => {
        dispatch(setVesselTrackDepth(depth))
    }

    return (
        <>
            <LastPositionsIcon
                title={"Affichage des dernières positions"}
                onClick={() => setLastPositionsBoxIsOpen(!lastPositionsBoxIsOpen)}>
                <Vessel/>
            </LastPositionsIcon>
            <LastPositionsBox
                lastPositionsBoxIsOpen={lastPositionsBoxIsOpen}
                firstUpdate={firstUpdate.current}>
                <LastPositionsHeader>
                    Gérer l'affichage des dernières positions
                </LastPositionsHeader>
                <LastPositionInfo>
                    <VesselHidden /> navires estompés <VesselShowed /> navires normaux
                </LastPositionInfo>
                <LastPositionsSlider
                    updateVesselsLastPositionVisibility={updateVesselsLastPositionVisibility}
                    vesselsLastPositionVisibility={vesselsLastPositionVisibility}
                />
                <LastPositionLegend>
                    Ces seuils permettent de régler l'affichage, l'estompage et le masquage des dernières positions des navires.
                </LastPositionLegend>
                <LastPositionsHeader>
                    Paramétrer la longueur par défaut des pistes
                </LastPositionsHeader>
                <TrackDepthRadio
                    updateVesselTrackDepth={updateVesselTrackDepth}
                    vesselTrackDepth={vesselTrackDepth}
                />
            </LastPositionsBox>
        </>
    )
}

const LastPositionLegend = styled.div`
  margin: 5px 5px 15px 25px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  text-align: left;
`

const VesselHidden = styled.span`
  border-radius: 50%;
  background: ${COLORS.grayVesselHidden};
  border: unset;
  margin-right: 5px;
  width: 8px;
  height: 8px;
  display: inline-block;
`

const VesselShowed = styled.span`
  border-radius: 50%;
  background: ${COLORS.grayDarkerThree};
  border: unset;
  margin-right: 5px;
  margin-left: 15px;
  width: 8px;
  height: 8px;
  display: inline-block;
`

const LastPositionInfo = styled.div`
  font-size: 10px;
  margin: 15px;
  color: ${COLORS.grayDarkerThree};
`

const LastPositionsHeader = styled.div`
  background: ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
`

const LastPositionsBox = styled.div`
  width: 406px;
  background: ${COLORS.background};
  margin-right: -420px;
  padding-bottom: 15px;
  top: 68px;
  right: 12px;
  border-radius: 1px;
  position: absolute;
  display: inline-block;
  animation: ${props => props.firstUpdate && !props.lastPositionsBoxIsOpen ? '' : props.lastPositionsBoxIsOpen ? 'last-positions-box-opening' : 'last-positions-box-closing'} 0.5s ease forwards;

  @keyframes last-positions-box-opening {
    0%   { margin-right: -420px; opacity: 0;  }
    100% { margin-right: 45px; opacity: 1; }
  }

  @keyframes last-positions-box-closing {
    0% { margin-right: 45px; opacity: 1; }
    100%   { margin-right: -420px; opacity: 0;  }
  }
`

const LastPositionsIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  padding: 3px 0px 0 3px;
  top: 60px;
  z-index: 9999;
  right: 2px;
  height: 40px;
  width: 40px;

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const Vessel = styled(VesselSVG)`
  width: 25px;
  height: 25px;
`

export default VesselVisibility
