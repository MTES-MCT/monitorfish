import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as SummarySVG } from '../components/icons/Picto_resume.svg'
import { ReactComponent as VesselIDSVG } from '../components/icons/Picto_identite.svg'
import { ReactComponent as FisheriesSVG } from '../components/icons/Picto_peche.svg'
import { ReactComponent as ControlsSVG } from '../components/icons/Picto_controles.svg'
import { ReactComponent as ObservationsSVG } from '../components/icons/Picto_ciblage.svg'
import { ReactComponent as VMSSVG } from '../components/icons/Picto_VMS_ERS.svg'
import VesselIdentity from '../components/vessel_sidebar/VesselIdentity'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../constants/constants'
import VesselSummary from '../components/vessel_sidebar/VesselSummary'
import VesselFishingActivities from '../components/fishing_activities/VesselFishingActivities'
import { showVesselSidebarTab } from '../domain/reducers/Vessel'
import VesselControls from '../components/controls/VesselControls'
import TrackDepthSelection from '../components/track_depth_selection/TrackDepthSelection'
import TrackExport from '../components/track_export/TrackExport'
import { MapComponentStyle } from '../components/commonStyles/MapComponent.style'
import { VesselSidebarTab } from '../domain/entities/vessel'

const VesselSidebar = () => {
  const dispatch = useDispatch()
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const error = useSelector(state => state.global.error)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const {
    vesselSidebarTab,
    vesselSidebarIsOpen
  } = useSelector(state => state.vessel)
  const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)

  const [openSidebar, setOpenSidebar] = useState(false)
  const firstUpdate = useRef(true)
  const [showedError, setShowedError] = useState(null)
  const [trackDepthSelectionIsOpen, setTrackDepthSelectionIsOpen] = useState(false)

  useEffect(() => {
    if (openSidebar === true) {
      firstUpdate.current = false
    } else {
      setTrackDepthSelectionIsOpen(false)
    }
  }, [openSidebar])

  useEffect(() => {
    if (isSameShowedError(error, showedError)) {
      return
    }

    if (isShowedError()) {
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
    if (vesselSidebarIsOpen) {
      setOpenSidebar(true)
      dispatch(showVesselSidebarTab(vesselSidebarTab))
    } else {
      setOpenSidebar(false)
    }
  }, [vesselSidebarIsOpen, vesselSidebarTab])

  return (
    <>
      <TrackDepthSelection
        openBox={openSidebar}
        init={!vesselSidebarIsOpen ? {} : null}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={rightMenuIsOpen}
        trackDepthSelectionIsOpen={trackDepthSelectionIsOpen}
        setTrackDepthSelectionIsOpen={setTrackDepthSelectionIsOpen}
      />
      <TrackExport
        openBox={openSidebar}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <Wrapper
        data-cy={'vessel-sidebar'}
        healthcheckTextWarning={healthcheckTextWarning}
        openBox={openSidebar}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={rightMenuIsOpen}
      >
        {
          <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !firstUpdate.current}/>
        }
        <div>
          <div>
            <TabList>
              <Tab
                isActive={vesselSidebarTab === VesselSidebarTab.SUMMARY}
                onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.SUMMARY))}
                data-cy={'vessel-menu-resume'}
              >
                <SummaryIcon/> <br/> Résumé
              </Tab>
              <Tab
                isActive={vesselSidebarTab === VesselSidebarTab.IDENTITY}
                onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.IDENTITY))}
                data-cy={'vessel-menu-identity'}
              >
                <VesselIDIcon/> <br/> Identité
              </Tab>
              <Tab
                isActive={vesselSidebarTab === VesselSidebarTab.VOYAGES}
                onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.VOYAGES))}
                data-cy={'vessel-menu-fishing'}
              >
                <FisheriesIcon/> <br/> Pêche
              </Tab>
              <Tab
                isActive={vesselSidebarTab === VesselSidebarTab.CONTROLS}
                onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.CONTROLS))}
                data-cy={'vessel-menu-controls'}
              >
                <ControlsIcon/> <br/> Contrôles
              </Tab>
              <Tab
                disabled
              >
                <ObservationsIcon/> <br/> Ciblage
              </Tab>
              <Tab
                isLast
                disabled
              >
                <VMSIcon/> <br/> VMS/ERS
              </Tab>
            </TabList>
            {
              !showedError
                ? <Panel>
                  {
                    vesselSidebarTab === VesselSidebarTab.SUMMARY
                      ? <VesselSummary/>
                      : null
                  }
                  {
                    vesselSidebarTab === VesselSidebarTab.IDENTITY
                      ? <VesselIdentity/>
                      : null
                  }
                  {
                    vesselSidebarTab === VesselSidebarTab.VOYAGES
                      ? <VesselFishingActivities/>
                      : null
                  }
                  {
                    vesselSidebarTab === VesselSidebarTab.CONTROLS
                      ? <VesselControls/>
                      : null
                  }
                </Panel>
                : <Error>
                  <ErrorText>
                    {showedError.message}
                  </ErrorText>
                </Error>
            }
          </div>
        </div>
      </Wrapper>
    </>
  )
}

const GrayOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0;
  background: ${COLORS.charcoal};
  animation: ${props => props.isOverlayed ? 'opacity-up' : 'opacity-down'} 0.5s ease forwards;
  z-index: 11;

  @keyframes opacity-up {
    0%   { opacity: 0; }
    100% { opacity: 0.5; z-index: 11; }
  }
    @keyframes opacity-down {
    0%   { opacity: 0.5; }
    100% { opacity: 0; z-index: -99999; }
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
  color: ${COLORS.slateGray};
`

const Panel = styled.div`
  padding: 0;
  overflow-y: auto;
  background: ${COLORS.gainsboro};
  max-height: 86vh;
`

const Tab = styled.button`
  padding-top: 5px;
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 65px;
  font-size: 12px;
  color: ${COLORS.lightGray};
  ${props => !props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null}
  background: ${props => props.isActive ? COLORS.shadowBlue : COLORS.charcoal};
  
  :hover, :focus, :active {
    background: ${COLORS.shadowBlue};
    ${props => !props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null}
  }
`

const TabList = styled.div`
  display: flex;
  background: ${COLORS.charcoal};
  border-top: 1px solid ${COLORS.lightGray};
`

const Wrapper = styled(MapComponentStyle)`
  position: absolute;
  top: 50px;
  width: 500px;
  max-height: 93vh;
  z-index: 999;
  padding: 0;
  background: white;
  overflow: hidden;
  margin-right: -510px;
 
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
