import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {ReactComponent as SummarySVG} from '../components/icons/Picto_resume.svg';
import {ReactComponent as VesselIDSVG} from '../components/icons/Picto_identite.svg';
import {ReactComponent as FisheriesSVG} from '../components/icons/Picto_peche.svg';
import {ReactComponent as ControlsSVG} from '../components/icons/Picto_controles.svg';
import {ReactComponent as ObservationsSVG} from '../components/icons/Picto_ciblage.svg';
import {ReactComponent as VMSSVG} from '../components/icons/Picto_VMS_ERS.svg';
import VesselIdentity from "../components/VesselIdentity";
import {useSelector} from "react-redux";
import {COLORS} from "../constants/constants";
import VesselSummary from "../components/VesselSummary";
import { FingerprintSpinner } from 'react-epic-spinners'
import FishingActivities from "../components/FishingActivities";
import getFishingActivities from "../domain/use_cases/getFishingActivities";
import {removeError} from "../domain/reducers/Global";

const VesselSidebar = () => {
    const error = useSelector(state => state.global.error)
    const vesselState = useSelector(state => state.vessel)
    const gears = useSelector(state => state.gear.gears)
    const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)

    const [openBox, setOpenBox] = useState(false);
    const [vessel, setVessel] = useState(null);
    const [index, setIndex] = useState(1)
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (openBox === true) {
            firstUpdate.current = false;
        }
    }, [openBox])

    useEffect(() => {
        if (vesselState.vesselSidebarIsOpen) {
            setOpenBox(true)
            setIndex(vesselState.vesselSidebarTabIndexToShow)
        } else {
            setOpenBox(false)
        }
    }, [vesselState.vesselSidebarIsOpen, vesselState.vesselSidebarTabIndexToShow])

    useEffect(() => {
        if (vesselState.selectedVessel) {
            setVessel(vesselState.selectedVessel)

            if(index === 3) {
                if(vesselState.selectedVesselFeatureAndIdentity && vesselState.selectedVesselFeatureAndIdentity.identity) {
                    dispatch(getFishingActivities(vesselState.selectedVesselFeatureAndIdentity.identity))
                }
            }
        }
    }, [vesselState.selectedVessel])

    const showFishingActivities = () => {
        if(vesselState.selectedVesselFeatureAndIdentity && vesselState.selectedVesselFeatureAndIdentity.identity) {
            dispatch(getFishingActivities(vesselState.selectedVesselFeatureAndIdentity.identity))
            setIndex(3)
        }
    }

    const showTab = tabNumber => {
        if(vessel) {
            dispatch(removeError())
            setIndex(tabNumber)
        }
    }

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            {
                <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !firstUpdate.current}/>
            }
            {
                vessel ? (vessel.internalReferenceNumber ||
                    vessel.externalReferenceNumber ||
                    vessel.ircs ||
                    vessel.mmsi) ? <div>
                    <div>
                        <TabList>
                            <Tab isActive={index === 1} onClick={() => showTab(1)}>
                                <SummaryIcon /> Résumé
                            </Tab>
                            <Tab isActive={index === 2} onClick={() => showTab(2)}>
                                <VesselIDIcon /> Identité
                            </Tab>
                            <Tab type="button" isActive={index === 3} onClick={() => showFishingActivities()}>
                                <FisheriesIcon /> <br/> Pêche
                            </Tab>
                            <Tab type="button" disabled isActive={index === 4} onClick={() => setIndex(3)}>
                                <ControlsIcon /> Contrôles
                            </Tab>
                            <Tab type="button" disabled isActive={index === 5} onClick={() => setIndex(4)}>
                                <ObservationsIcon /> Ciblage
                            </Tab>
                            <Tab type="button" disabled isActive={index === 6} onClick={() => setIndex(5)}>
                                <VMSIcon /> VMS/ERS
                            </Tab>
                        </TabList>

                        {
                            !vesselState.loadingVessel && !error ? <>
                                <Panel className={index === 1 ? '' : 'hide'}>
                                    <VesselSummary
                                        vessel={vessel}
                                        gears={gears}
                                    />
                                </Panel>
                                <Panel className={index === 2 ? '' : 'hide'}>
                                    <VesselIdentity
                                        vessel={vessel}
                                        gears={gears}
                                    />
                                </Panel>
                                <Panel className={index === 3 ? '' : 'hide'}>
                                    <FishingActivities fishingActivities={vesselState.fishingActivities}/>
                                </Panel>
                                <Panel className={index === 4 ? '' : 'hide'}>
                                    <h1>TODO</h1>
                                </Panel>
                                <Panel className={index === 5 ? '' : 'hide'}>
                                    <h1>TODO</h1>
                                </Panel>
                                <Panel className={index === 6 ? '' : 'hide'}>
                                    <h1>TODO</h1>
                                </Panel>
                            </> : error ? <Error>
                                <ErrorText>
                                    { error.message }
                                </ErrorText>
                            </Error> : <FingerprintSpinner color={COLORS.grayDarkerThree} className={'radar'} size={100}/>
                        }

                    </div>
                </div> : <Error>
                        <ErrorText>
                            Nous n'avons pas d'information sur ce navire...
                        </ErrorText>
                    </Error> : <FingerprintSpinner color={COLORS.grayDarkerThree} className={'radar'} size={100}/>
            }

        </Wrapper>
    )
}

const GrayOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0;
  background: ${COLORS.grayDarkerThree};
  animation: ${props => props.isOverlayed ? 'opacity-up' : 'opacity-down' } 0.5s ease forwards;

  @keyframes opacity-up {
    0%   { opacity: 0;   }
    100% { opacity: 0.5; z-index: 0; }
  }
    @keyframes opacity-down {
    0%   { opacity: 0.5;   }
    100% { opacity: 0; z-index: -99999;}
  }
`

const Error = styled.div`
  padding: 5px 10px 10px 10px;
  right: 0;
`

const ErrorText = styled.div`
  padding: 10px 10px 5px 10px;
  display: table-cell;
  font-size: 15px;
  vertical-align: middle;
  height: inherit;
  color: ${COLORS.textGray};
`

const Panel = styled.div`
  padding: 0;
  overflow-y: auto;
  background: #F0F0F0;
  max-height: 86vh;
`

const Tab = styled.button`
  padding-top: 10px;
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 65px;
  font-size: 13px;
  color: ${COLORS.grayDarker};
  border-right: 1px solid ${COLORS.grayDarkerTwo};
  background: ${props => props.isActive ? COLORS.textGray : COLORS.grayDarkerThree};
  
  :hover, :focus, :active {
    background: ${COLORS.textGray};
  }
`

const TabList = styled.div`
  display: flex;
  background: ${COLORS.grayDarkerThree};
  border-bottom: 1px solid ${COLORS.grayDarkerTwo};
  border-top: 1px solid ${COLORS.grayDarkerTwo};
`

const Wrapper = styled.div`
  position: absolute;
  top: 52px;
  right: 10px;
  width: 500px;
  max-height: 93vh;
  z-index: 999999;
  padding: 0;
  background: white;
  overflow: hidden;
  margin: 0;
  margin-right: -510px;
  border-top: 1px solid ${COLORS.grayDarkerTwo};
 
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'vessel-box-opening' : 'vessel-box-closing'} 0.5s ease forwards;

  @keyframes vessel-box-opening {
    0%   { margin-right: -510px;   }
    100% { margin-right: 0; }
  }

  @keyframes vessel-box-closing {
    0% { margin-right: 0; }
    100%   { margin-right: -510px;   }
  }
`

const VesselIDIcon = styled(VesselIDSVG)`
  width: 30px;
`

const ControlsIcon = styled(ControlsSVG)`
  width: 30px;
`

const ObservationsIcon = styled(ObservationsSVG)`
  width: 30px;
`

const VMSIcon = styled(VMSSVG)`
  width: 30px;
`

const FisheriesIcon = styled(FisheriesSVG)`
  width: 30px;
`

const SummaryIcon = styled(SummarySVG)`
  width: 30px;
`

export default VesselSidebar
