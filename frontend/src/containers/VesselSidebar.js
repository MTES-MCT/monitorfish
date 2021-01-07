import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {ReactComponent as VesselIDSVG} from '../components/icons/picto_carte_identite_navire.svg';
import {ReactComponent as FisheriesSVG} from '../components/icons/Picto_activites_peche.svg';
import {ReactComponent as ControlsSVG} from '../components/icons/Picto_controles.svg';
import {ReactComponent as ObservationsSVG} from '../components/icons/Picto_observations_ciblage.svg';
import {ReactComponent as VMSSVG} from '../components/icons/Picto_VMS_ERS.svg';
import VesselIdentity from "../components/VesselIdentity";
import {useDispatch, useSelector} from "react-redux";
import {COLORS} from "../constants/constants";

const VesselSidebar = () => {
    const vesselState = useSelector(state => state.vessel)
    const gears = useSelector(state => state.gear.gears)

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
        if (vesselState.vesselBoxIsOpen) {
            setOpenBox(true)
            setIndex(vesselState.vesselBoxTabIndexToShow)
        } else {
            setOpenBox(false)
        }
    }, [vesselState.vesselBoxIsOpen, vesselState.vesselBoxTabIndexToShow])

    useEffect(() => {
        if (vesselState.selectedVessel) {
            setVessel(vesselState.selectedVessel)
        }
    }, [vesselState.selectedVessel])

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            {
                vessel ? (vessel.internalReferenceNumber ||
                    vessel.externalReferenceNumber ||
                    vessel.MMSI ||
                    vessel.IRCS) ? <div>
                    <div>
                        <TabList>
                            <Tab isActive={index === 1} onClick={() => setIndex(1)}>
                                <VesselIDIcon /> Identité
                            </Tab>
                            <Tab type="button" disabled isActive={index === 2} onClick={() => setIndex(2)}>
                                <FisheriesIcon /> <br/> Pêche
                            </Tab>
                            <Tab type="button" disabled isActive={index === 3} onClick={() => setIndex(3)}>
                                <ControlsIcon /> Contrôles
                            </Tab>
                            <Tab type="button" disabled isActive={index === 4} onClick={() => setIndex(4)}>
                                <ObservationsIcon /> Observations
                            </Tab>
                            <Tab type="button" disabled isActive={index === 5} onClick={() => setIndex(5)}>
                                <VMSIcon /> VMS/ERS
                            </Tab>
                        </TabList>

                        <Panel className={index === 1 ? '' : 'hide'}>
                            <VesselIdentity
                                vessel={vessel}
                                gears={gears}
                            />
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
                    </div> </div> : <VesselNotFound>
                        <VesselNotFoundText>
                            <VesselNotFoundImage src="boat_fishing_not_found.png"/>
                            <p>Nous n'avons pas trouvé ce navire dans notre base de donnée...</p>
                        </VesselNotFoundText>
                    </VesselNotFound> : "Récupération..."
            }

        </Wrapper>
    )
}

const VesselNotFoundImage = styled.img`
  height: 150px;
`

const VesselNotFound = styled.div`
  padding: 5px 10px 10px 10px;
  right: 0;
`

const VesselNotFoundText = styled.div`
  padding: 5px 10px 10px 10px;
  display: table-cell;
  font-size: 13px;
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
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 60px;
  font-size: 13px;
  color: ${props => props.isActive ? COLORS.grayDarkerThree : COLORS.textGray};
  border-right: 1px solid ${COLORS.grayDarkerTwo};
  background: ${props => props.isActive ? COLORS.textGray : COLORS.grayDarkerThree};
  
  :hover {
    background: ${COLORS.textGray};
    color: ${COLORS.grayDarkerThree};
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
  width: 23px;
  margin-top: -1px;
`

const ObservationsIcon = styled(ObservationsSVG)`
  width: 35px;
`

const VMSIcon = styled(VMSSVG)`
  width: 20px;
  margin-top: 2px;
`

const FisheriesIcon = styled(FisheriesSVG)`
  width: 30px;
  margin-top: 3px;
`

export default VesselSidebar
