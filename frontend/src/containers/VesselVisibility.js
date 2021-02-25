import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";

import {ReactComponent as VesselSVG} from '../components/icons/Icone_navire.svg';
import {COLORS} from "../constants/constants";
import LastPositionsSlider from "../components/LastPositionsSlider";
import {
    setVesselLabel,
    setVesselLabelsShowedOnMap,
    setVesselsLastPositionVisibility,
    setVesselTrackDepth
} from "../domain/reducers/Map";
import TrackDepthRadio from "../components/TrackDepthRadio";
import VesselLabelRadio from "../components/VesselLabelRadio";
import VesselLabelCheckbox from "../components/VesselLabelCheckbox";

const VesselVisibility = () => {
    const dispatch = useDispatch()
    const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
    const vesselTrackDepth = useSelector(state => state.map.vesselTrackDepth)
    const vesselLabel = useSelector(state => state.map.vesselLabel)
    const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
    const firstUpdate = useRef(true);
    const [vesselVisibilityBoxIsOpen, setVesselVisibilityBoxIsOpen] = useState(false);

    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setVesselVisibilityBoxIsOpen(false)
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        if (vesselVisibilityBoxIsOpen === true) {
            firstUpdate.current = false;
        }
    }, [vesselVisibilityBoxIsOpen])

    const updateVesselsLastPositionVisibility = (hidden, opacityReduced) => {
        dispatch(setVesselsLastPositionVisibility({
            opacityReduced: opacityReduced,
            hidden: hidden
        }))
    }

    const updateVesselTrackDepth = depth => {
        dispatch(setVesselTrackDepth(depth))
    }

    const updateVesselLabel = label => {
        dispatch(setVesselLabel(label))
    }

    const updateVesselLabelsShowedOnMap = isShowed => {
        dispatch(setVesselLabelsShowedOnMap(isShowed))
    }

    return (
        <div ref={wrapperRef}>
            <VesselVisibilityIcon
                title={"Affichage des dernières positions"}
                onClick={() => setVesselVisibilityBoxIsOpen(!vesselVisibilityBoxIsOpen)}>
                <Vessel/>
            </VesselVisibilityIcon>
            <VesselVisibilityBox
                lastPositionsBoxIsOpen={vesselVisibilityBoxIsOpen}
                firstUpdate={firstUpdate.current}>
                <Header>
                    Gérer l'affichage des dernières positions
                </Header>
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
                <Header>
                    Paramétrer la longueur par défaut des pistes
                </Header>
                <TrackDepthRadio
                    updateVesselTrackDepth={updateVesselTrackDepth}
                    vesselTrackDepth={vesselTrackDepth}
                />
                <Header>
                    Gérer l'affichage des étiquettes des navires
                </Header>
                <VesselLabel>
                    Choisir le libellé des étiquettes des navires
                </VesselLabel>
                <VesselLabelRadio
                    updateVesselLabel={updateVesselLabel}
                    vesselLabel={vesselLabel}
                />
                <ShowVesselLabel>
                    <VesselLabelCheckbox
                        updateVesselLabelsShowedOnMap={updateVesselLabelsShowedOnMap}
                        vesselLabelsShowedOnMap={vesselLabelsShowedOnMap}
                    />
                </ShowVesselLabel>
            </VesselVisibilityBox>
        </div>
    )
}

const ShowVesselLabel = styled.div`
  background: ${COLORS.grayBackground};
  padding: 0 0 0 13px;
`

const VesselLabel = styled.div`
  margin: 15px 5px 0 25px;
  font-size: 13px;
  color: ${COLORS.textGray};
  text-align: left;
`

const LastPositionLegend = styled.div`
  margin: 5px 5px 15px 25px;
  font-size: 13px;
  color: ${COLORS.textGray};
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

const Header = styled.div`
  background: ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
`

const VesselVisibilityBox = styled.div`
  width: 406px;
  background: ${COLORS.background};
  margin-right: -420px;
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

const VesselVisibilityIcon = styled.button`
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
