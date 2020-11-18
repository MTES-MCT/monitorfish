import React, {useContext, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import ReactCountryFlag from "react-country-flag";
import {ReactComponent as VesselIDSVG} from './icons/picto_carte_identite_navire.svg';
import {ReactComponent as FisheriesSVG} from './icons/Picto_activites_peche.svg';
import {ReactComponent as ControlsSVG} from './icons/Picto_controles.svg';
import {ReactComponent as ObservationsSVG} from './icons/Picto_observations_ciblage.svg';
import {ReactComponent as VMSSVG} from './icons/Picto_VMS_ERS.svg';
import {Context} from "../Store";
import VesselIdentity from "./VesselIdentity";

const VesselBox = () => {
    const [openBox, setOpenBox] = useState(false);
    const [vessel, setVessel] = useState(null);
    const [index, setIndex] = useState(1)
    const [state, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (openBox === true) {
            firstUpdate.current = false;
        }
    }, [openBox])

    useEffect(() => {
        if (state.vessel.vesselTrackToShow || state.vessel.vessel) {
            setOpenBox(true)
        } else if (!state.vessel.vessel) {
            setOpenBox(false)
        }
    }, [state.vessel.vesselTrackToShow, state.vessel.vessel])

    useEffect(() => {
        if (state.vessel.vessel) {
            setVessel(state.vessel.vessel)
        }
    }, [state.vessel.vessel])

    function hideVessel() {
        dispatch({type: 'RESET_VESSEL_TRACK_VECTOR'});
        dispatch({type: 'RESET_VESSEL'});
        setVessel(null)
    }

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            {
                vessel ? <div>
                        <VesselHeader>
                            <ReactCountryFlag countryCode={vessel.flagState}
                                              style={{fontSize: '2em'}}/>
                            <VesselName>{vessel.vesselName} {' '}
                                <VesselCountry>({vessel.flagState})</VesselCountry>
                            </VesselName>
                            <Close src={'close.png'} onClick={() => hideVessel()}/>
                        </VesselHeader>
                    <div>
                        <TabList>
                            <Tab className={index === 1 ? 'active-tab' : ''} onClick={() => setIndex(1)}>
                                <VesselIDIcon />
                            </Tab>
                            <Tab className={index === 2 ? 'active-tab' : ''} onClick={() => setIndex(2)}>
                                <FisheriesIcon />
                            </Tab>
                            <Tab className={index === 3 ? 'active-tab' : ''} onClick={() => setIndex(3)}>
                                <ControlsIcon onClick={() => setIndex(1)} />
                            </Tab>
                            <Tab className={index === 4 ? 'active-tab' : ''} onClick={() => setIndex(4)}>
                                <ObservationsIcon />
                            </Tab>
                            <Tab className={index === 5 ? 'active-tab' : ''} onClick={() => setIndex(5)}>
                                <VMSIcon />
                            </Tab>
                        </TabList>

                        <Panel className={index === 1 ? '' : 'hide'}>
                            <VesselIdentity vessel={vessel}/>
                        </Panel>
                        <Panel className={index === 2 ? '' : 'hide'}>
                            <h1>TODO</h1>
                        </Panel>
                        <Panel className={index === 3 ? '' : 'hide'}>
                            <h1>TODO</h1>
                        </Panel>
                        <Panel className={index === 4 ? '' : 'hide'}>
                            <h1>TODO</h1>
                        </Panel>
                        <Panel className={index === 5 ? '' : 'hide'}>
                            <h1>TODO</h1>
                        </Panel>
                    </div> </div>: "Récupération..."
            }

        </Wrapper>
    )
}

const Close = styled.img`
  width: 12px;
  float: right;
  margin-top: 9px;
  padding: 5px 5px 5px 5px;
  cursor: pointer;
`

const Panel = styled.div`
  padding: 5px 5px 5px 10px;
  height: 800px;
  overflow-y: auto;
`

const Tab = styled.button`
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 55px;
`

const TabList = styled.div`
  display: flex;
  border-top: 1px solid rgba(5, 5, 94, 0.6);
`

const Wrapper = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  width: 450px;
  height: calc(100vh - 50px - 6px);
  z-index: 999;
  padding: 3px 0px 3px 0px;
  background: white;
  overflow-y: hidden;
  overflow-x: hidden;
  margin: 0;
  margin-right: -450px;
 
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'vessel-box-opening' : 'vessel-box-closing'} 1s ease forwards;

  @keyframes vessel-box-opening {
    0%   { margin-right: -450px;   }
    100% { margin-right: 0; }
  }

  @keyframes vessel-box-closing {
    0% { margin-right: 0; }
    100%   { margin-right: -450px;   }
  }
`

const VesselHeader = styled.div`
  padding: 5px 10px 10px 10px;
  text-transform: uppercase;
  text-align: left;
`

const VesselName = styled.span`
  display: inline-block;
  font-size: 1.4rem;
  margin: 0 0 0 10px;
  vertical-align: bottom;
  font-weight: bolder;
`

const VesselCountry = styled.span`
  color: rgba(5, 5, 94, 0.4);
`

const VesselIDIcon = styled(VesselIDSVG)`
  width: 40px;
`

const ControlsIcon = styled(ControlsSVG)`
  width: 33px;
`

const ObservationsIcon = styled(ObservationsSVG)`
  width: 45px;
`

const VMSIcon = styled(VMSSVG)`
  width: 30px;
`

const FisheriesIcon = styled(FisheriesSVG)`
  width: 40px;
`

export default VesselBox
