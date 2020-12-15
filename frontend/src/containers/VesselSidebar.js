import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import ReactCountryFlag from "react-country-flag";
import {ReactComponent as VesselIDSVG} from '../components/icons/picto_carte_identite_navire.svg';
import {ReactComponent as FisheriesSVG} from '../components/icons/Picto_activites_peche.svg';
import {ReactComponent as ControlsSVG} from '../components/icons/Picto_controles.svg';
import {ReactComponent as ObservationsSVG} from '../components/icons/Picto_observations_ciblage.svg';
import {ReactComponent as VMSSVG} from '../components/icons/Picto_VMS_ERS.svg';
import {ReactComponent as CloseIconSVG} from '../components/icons/Croix_grise.svg'
import VesselIdentity from "../components/VesselIdentity";
import {useDispatch, useSelector} from "react-redux";
import hideVesselBox from "../use_cases/hideVesselBox";
import {COLORS} from "../constants/constants";

const VesselSidebar = () => {
    const vesselState = useSelector(state => state.vessel)
    const dispatch = useDispatch()

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

    function hideVessel() {
        dispatch(hideVesselBox())
    }

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            {
                vessel ? (vessel.internalReferenceNumber ||
                    vessel.externalReferenceNumber ||
                    vessel.MMSI ||
                    vessel.IRCS) ? <div>
                        <VesselHeader>
                            {vessel.flagState ? <ReactCountryFlag countryCode={vessel.flagState}
                                                                  style={{fontSize: '2em'}}/> : null}
                            <VesselName>{vessel.vesselName} {' '}
                                <VesselCountry>({vessel.flagState})</VesselCountry>
                            </VesselName>
                            <CloseIcon onClick={() => hideVessel()}/>
                        </VesselHeader>
                    <div>
                        <TabList>
                            <Tab className={index === 1 ? 'active-tab' : ''} onClick={() => setIndex(1)}>
                                <VesselIDIcon />
                            </Tab>
                            <Tab type="button" disabled className={index === 2 ? 'active-tab' : ''} onClick={() => setIndex(2)}>
                                <FisheriesIcon />
                            </Tab>
                            <Tab type="button" disabled className={index === 3 ? 'active-tab' : ''} onClick={() => setIndex(3)}>
                                <ControlsIcon onClick={() => setIndex(1)} />
                            </Tab>
                            <Tab type="button" disabled className={index === 4 ? 'active-tab' : ''} onClick={() => setIndex(4)}>
                                <ObservationsIcon />
                            </Tab>
                            <Tab type="button" disabled className={index === 5 ? 'active-tab' : ''} onClick={() => setIndex(5)}>
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
                    </div> </div> : <VesselNotFound>
                        <Close src={'close.png'} onClick={() => hideVessel()}/>
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
  height: 200px;
`

const VesselNotFound = styled.div`
  padding: 5px 10px 10px 10px;
  position: absolute;
  right: 0;
  height: inherit;
`

const VesselNotFoundText = styled.div`
  padding: 5px 10px 10px 10px;
  display: table-cell;
  vertical-align: middle;
  height: inherit;
  color: ${COLORS.textGray};
`

const Close = styled.img`
  width: 12px;
  float: right;
  margin-top: 9px;
  padding: 5px 5px 5px 5px;
  cursor: pointer;
`

const Panel = styled.div`
  padding: 5px 5px 5px 10px;
  height: 790px;
  overflow-y: auto;
`

const Tab = styled.button`
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 45px;
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
  height: calc(100vh - 50px - 4px);
  z-index: 999;
  padding: 0 0px 3px 0px;
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
  background: ${COLORS.background};
  color: ${COLORS.textWhite};
`

const VesselName = styled.span`
  display: inline-block;
  font-size: 1.4rem;
  margin: 0 0 0 10px;
  vertical-align: bottom;
  font-weight: bolder;
`

const VesselCountry = styled.span`
  color: rgba(255, 255, 255, 0.4);
`

const VesselIDIcon = styled(VesselIDSVG)`
  width: 30px;
`

const ControlsIcon = styled(ControlsSVG)`
  width: 23px;
`

const ObservationsIcon = styled(ObservationsSVG)`
  width: 35px;
`

const VMSIcon = styled(VMSSVG)`
  width: 20px;
`

const FisheriesIcon = styled(FisheriesSVG)`
  width: 30px;
`

const CloseIcon = styled(CloseIconSVG)`
    width: 15px;
    float: right;
    margin-right: 7px;
    height: 1.5em;
    margin-top: 6px;
    cursor: pointer;
`

export default VesselSidebar
