import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {ReactComponent as SummarySVG} from '../components/icons/Picto_resume.svg';
import {ReactComponent as VesselIDSVG} from '../components/icons/Picto_identite.svg';
import {ReactComponent as FisheriesSVG} from '../components/icons/Picto_peche.svg';
import {ReactComponent as ControlsSVG} from '../components/icons/Picto_controles.svg';
import {ReactComponent as ObservationsSVG} from '../components/icons/Picto_ciblage.svg';
import {ReactComponent as VMSSVG} from '../components/icons/Picto_VMS_ERS.svg';
import VesselIdentity from "../components/vessel_sidebar/VesselIdentity";
import {useDispatch, useSelector} from "react-redux";
import {COLORS} from "../constants/constants";
import VesselSummary from "../components/vessel_sidebar/VesselSummary";
import { FingerprintSpinner } from 'react-epic-spinners'
import VesselFishingActivities from "../components/fishing_activities/VesselFishingActivities";
import getFishingActivities from "../domain/use_cases/getFishingActivities";
import {removeError} from "../domain/reducers/Global";
import {
    resetNextControlResumeAndControls,
    resetNextFishingActivities,
    setControlResumeAndControls,
    setFishingActivities, setTemporaryTrackDepth
} from '../domain/reducers/Vessel'
import getControls from '../domain/use_cases/getControls'
import VesselControls from '../components/controls/VesselControls'
import showVesselTrackAndSidebar from '../domain/use_cases/showVesselTrackAndSidebar'
import TrackDepthSelection from '../components/track_depth_selection/TrackDepthSelection'
import TrackExport from '../components/track_export/TrackExport'

const VesselSidebar = () => {
    const dispatch = useDispatch()

    const error = useSelector(state => state.global.error)
    const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
    const vesselState = useSelector(state => state.vessel)
    const gears = useSelector(state => state.gear.gears)
    const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)
    const vesselTrackDepth = useSelector(state => state.map.vesselTrackDepth)

    const [controlsFromDate, setControlFromDate] = useState(new Date(new Date().getUTCFullYear() - 5, 0, 1))
    const [openSidebar, setOpenSidebar] = useState(false)
    const [vessel, setVessel] = useState(null)
    const [index, setIndex] = useState(1)
    const firstUpdate = useRef(true)
    const [showedError, setShowedError] = useState(null)

    const [trackDepthSelectionIsOpen, setTrackDepthSelectionIsOpen] = useState(false)

    useEffect(() => {
        if (openSidebar === true) {
            firstUpdate.current = false;
        }
    }, [openSidebar])

    useEffect(() => {
        if(isSameShowedError(error, showedError)) {
            return
        }

        if(isShowedError()) {
            setShowedError(error)
            return
        }

        setShowedError(null)
    }, [error])

    function isSameShowedError (error, showedError) {
        return error &&
          showedError &&
          error.name === showedError.name
    }

    function isShowedError () {
        return error && !error.showEmptyComponentFields
    }

    useEffect(() => {
        if (vesselState.vesselSidebarIsOpen) {
            setOpenSidebar(true)
            setIndex(vesselState.vesselSidebarTabIndexToShow)
        } else {
            setOpenSidebar(false)
        }
    }, [vesselState.vesselSidebarIsOpen, vesselState.vesselSidebarTabIndexToShow])

    useEffect(() => {
        if (vesselState.selectedVessel) {
            setVessel(vesselState.selectedVessel)

            if(index === 3) {
                if(vesselState.selectedVesselFeatureAndIdentity && vesselState.selectedVesselFeatureAndIdentity.identity) {
                    dispatch(getFishingActivities(vesselState.selectedVesselFeatureAndIdentity.identity))
                }
            } else if (index === 4) {
                dispatch(getControls(vesselState.selectedVessel.id, controlsFromDate))
            }
        }
    }, [vesselState.selectedVessel])

    const showFishingActivities = () => {
        if(vesselState.selectedVesselFeatureAndIdentity && vesselState.selectedVesselFeatureAndIdentity.identity) {
            dispatch(getFishingActivities(vesselState.selectedVesselFeatureAndIdentity.identity))
            setIndex(3)
        }
    }

    const showControls = () => {
        if(vessel) {
            dispatch(getControls(vessel.id, controlsFromDate))
            setIndex(4)
        }
    }

    const showTab = tabNumber => {
        if(vessel) {
            dispatch(removeError())
            setIndex(tabNumber)
        }
    }

    useEffect(() => {
        if(vessel && controlsFromDate) {
            dispatch(getControls(vessel.id, controlsFromDate, true))
        }
    }, [controlsFromDate])

    const updateFishingActivities = nextFishingActivities => {
        if(nextFishingActivities) {
            dispatch(setFishingActivities(nextFishingActivities))
            dispatch(resetNextFishingActivities())
        }
    }

    const updateControlResumeAndControls = nextControlResumeAndControls => {
        if(nextControlResumeAndControls) {
            dispatch(setControlResumeAndControls(nextControlResumeAndControls))
            dispatch(resetNextControlResumeAndControls())
        }
    }

    const showVesselTrackWithTrackDepth = (trackDepth, afterDateTime, beforeDateTime) => {
        const trackDepthObject = {
            trackDepth: trackDepth,
            afterDateTime: afterDateTime,
            beforeDateTime: beforeDateTime
        }

        dispatch(setTemporaryTrackDepth(trackDepthObject))
        if(vesselState.selectedVesselFeatureAndIdentity && trackDepth) {
            dispatch(showVesselTrackAndSidebar(
              vesselState.selectedVesselFeatureAndIdentity,
              false,
              true,
              trackDepthObject))
        }
    }

    return (
      <>
          {
              vessel
                ? <TrackDepthSelection
                  openBox={openSidebar}
                  init={!vesselState.vesselSidebarIsOpen ? {} : null}
                  firstUpdate={firstUpdate.current}
                  rightMenuIsOpen={rightMenuIsOpen}
                  vesselTrackDepth={vesselTrackDepth}
                  trackDepthSelectionIsOpen={trackDepthSelectionIsOpen}
                  showVesselTrackWithTrackDepth={showVesselTrackWithTrackDepth}
                  setTrackDepthSelectionIsOpen={setTrackDepthSelectionIsOpen}
                />
                : null
          }
          {
              vessel && vessel.positions
                ? <TrackExport
                  positions={vessel.positions}
                  openBox={openSidebar}
                  firstUpdate={firstUpdate.current}
                  rightMenuIsOpen={rightMenuIsOpen}
                />
                : null
          }
            <Wrapper
              openBox={openSidebar}
              firstUpdate={firstUpdate.current}
              rightMenuIsOpen={rightMenuIsOpen}
            >
                {
                    <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !firstUpdate.current}/>
                }
                {
                    vessel ? <div>
                        <div>
                            <TabList>
                                <Tab isActive={index === 1} onClick={() => showTab(1)}>
                                    <SummaryIcon /> <br/> Résumé
                                </Tab>
                                <Tab isActive={index === 2} onClick={() => showTab(2)}>
                                    <VesselIDIcon /> <br/> Identité
                                </Tab>
                                <Tab type="button" isActive={index === 3} onClick={() => showFishingActivities()}>
                                    <FisheriesIcon /> <br/> Pêche
                                </Tab>
                                <Tab type="button" isActive={index === 4} onClick={() => showControls()}>
                                    <ControlsIcon /> <br/>  Contrôles
                                </Tab>
                                <Tab type="button" disabled isActive={index === 5} onClick={() => setIndex(5)}>
                                    <ObservationsIcon /> <br/> Ciblage
                                </Tab>
                                <Tab type="button" disabled isActive={index === 6} onClick={() => setIndex(6)}>
                                    <VMSIcon /> <br/> VMS/ERS
                                </Tab>
                            </TabList>
                            {
                                !vesselState.loadingVessel
                                  ? <>
                                    <Panel className={index === 1 ? '' : 'hide'}>
                                        <VesselSummary
                                          vessel={vessel}
                                          gears={gears}
                                          vesselLastPositionFeature={vesselState.selectedVesselFeatureAndIdentity && vesselState.selectedVesselFeatureAndIdentity.feature}
                                        />
                                    </Panel>
                                    <Panel className={index === 2 ? '' : 'hide'}>
                                        <VesselIdentity
                                          vessel={vessel}
                                          gears={gears}
                                        />
                                    </Panel>
                                    <Panel className={index === 3 ? '' : 'hide'}>
                                        <VesselFishingActivities
                                            fishingActivities={vesselState.fishingActivities}
                                            nextFishingActivities={vesselState.nextFishingActivities}
                                            updateFishingActivities={updateFishingActivities}
                                        />
                                    </Panel>
                                    <Panel className={index === 4 ? '' : 'hide'}>
                                        <VesselControls
                                          setControlFromDate={setControlFromDate}
                                          controlsFromDate={controlsFromDate}
                                          controlResumeAndControls={vesselState.controlResumeAndControls}
                                          nextControlResumeAndControls={vesselState.nextControlResumeAndControls}
                                          updateControlResumeAndControls={updateControlResumeAndControls}
                                        />
                                    </Panel>
                                    <Panel className={index === 5 ? '' : 'hide'}>

                                    </Panel>
                                    <Panel className={index === 6 ? '' : 'hide'}>

                                    </Panel>
                                </> : showedError ? <Error>
                                    <ErrorText>
                                        { showedError.message }
                                    </ErrorText>
                                </Error> : <FingerprintSpinner color={COLORS.grayDarkerThree} className={'radar'} size={100}/>
                            }
                        </div>
                    </div> : <FingerprintSpinner color={COLORS.grayDarkerThree} className={'radar'} size={100}/>
                }
            </Wrapper>
          </>
    )
}

const GrayOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0;
  background: ${COLORS.grayDarkerThree};
  animation: ${props => props.isOverlayed ? 'opacity-up' : 'opacity-down' } 0.5s ease forwards;
  z-index: 11;

  @keyframes opacity-up {
    0%   { opacity: 0;   }
    100% { opacity: 0.5; z-index: 11; }
  }
    @keyframes opacity-down {
    0%   { opacity: 0.5;   }
    100% { opacity: 0; z-index: -99999;}
  }
`

const Error = styled.div`
  height: 50px;
  padding: 5px 10px 10px 10px;
  right: 0;
`

const ErrorText = styled.div`
  padding: 5px 10px 5px 10px;
  display: table-cell;
  font-size: 15px;
  vertical-align: middle;
  height: inherit;
  color: ${COLORS.textGray};
`

const Panel = styled.div`
  padding: 0;
  overflow-y: auto;
  background: ${COLORS.grayBackground};
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
  top: 50px;
  right: 10px;
  width: 500px;
  max-height: 93vh;
  z-index: 999;
  padding: 0;
  background: white;
  overflow: hidden;
  margin: 0;
  margin-right: -510px;
  border-top: 1px solid ${COLORS.grayDarkerTwo};
 
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'vessel-box-opening' : 'vessel-box-closing'} 0.5s ease forwards,
  ${props => props.rightMenuIsOpen && props.openBox ? 'vessel-box-opening-with-right-menu-hover' : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  @keyframes vessel-box-opening {
    0%   { margin-right: -510px;   }
    100% { margin-right: 0; }
  }

  @keyframes vessel-box-closing {
    0% { margin-right: 0; }
    100%   { margin-right: -510px;   }
  }
  
  @keyframes vessel-box-opening-with-right-menu-hover {
    0%   { right: 10px;   }
    100% { right: 55px; }
  }

  @keyframes vessel-box-closing-with-right-menu-hover {
    0% { right: 55px; }
    100%   { right: 10px;   }
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
  margin: 0 5px 0 5px;
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
