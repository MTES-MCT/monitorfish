import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as SummarySVG } from '../icons/Picto_resume.svg'
import { ReactComponent as VesselIDSVG } from '../icons/Picto_identite.svg'
import { ReactComponent as FisheriesSVG } from '../icons/Picto_peche.svg'
import { ReactComponent as ControlsSVG } from '../icons/Picto_controles.svg'
import { ReactComponent as ReportingSVG } from '../icons/Icone_onglet_signalement.svg'
import { ReactComponent as VMSSVG } from '../icons/Icone_VMS_fiche_navire.svg'
import VesselIdentity from './VesselIdentity'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import VesselSummary from './VesselSummary'
import VesselFishingActivities from './fishing_activities/VesselFishingActivities'
import { showVesselSidebarTab } from '../../domain/shared_slices/Vessel'
import VesselControls from './controls/VesselControls'
import TrackRequest from './actions/track_request/TrackRequest'
import TrackExport from './actions/track_export/TrackExport'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { VesselSidebarTab } from '../../domain/entities/vessel'
import HideNonSelectedVessels from './actions/hide_non_selected_vessels/HideNonSelectedVessels'
import AnimateToTrack from './actions/animate_to_track/AnimateToTrack'
import ShowFishingActivitiesOnMap from './actions/show_fishing_activities/ShowFishingActivitiesOnMap'
import AlertWarning from './warnings/AlertWarning'
import BeaconMalfunctionWarning from './warnings/BeaconMalfunctionWarning'
import VesselBeaconMalfunctions from './beacon_malfunctions/VesselBeaconMalfunctions'
import AddToFavorites from './actions/add_to_favorites/AddToFavorites'
import VesselReportings from './reporting/VesselReportings'

const VesselSidebar = () => {
  const dispatch = useDispatch()
  const {
    healthcheckTextWarning,
    rightMenuIsOpen
  } = useSelector(state => state.global)
  const {
    selectedVessel,
    vesselSidebarTab,
    vesselSidebarIsOpen
  } = useSelector(state => state.vessel)
  const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)
  const adminRole = useSelector(state => state.global.adminRole)

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [trackRequestIsOpen, setTrackRequestIsOpen] = useState(false)

  const setTrackRequestIsOpenCallback = useCallback(isOpen => {
    setTrackRequestIsOpen(isOpen)
  }, [])

  useEffect(() => {
    if (sidebarIsOpen === true) {
      firstUpdate.current = false
    } else {
      setTrackRequestIsOpen(false)
    }
  }, [sidebarIsOpen])

  useEffect(() => {
    if (vesselSidebarIsOpen) {
      setSidebarIsOpen(true)
      dispatch(showVesselSidebarTab(vesselSidebarTab))
    } else {
      setSidebarIsOpen(false)
    }
  }, [vesselSidebarIsOpen, vesselSidebarTab])

  useEffect(() => {
    if (!adminRole && vesselSidebarTab) {
      dispatch(showVesselSidebarTab(vesselSidebarTab))
    }
  }, [adminRole, vesselSidebarTab])

  return (
    <>
      <AddToFavorites
        sidebarIsOpen={sidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <TrackRequest
        sidebarIsOpen={sidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
        trackRequestIsOpen={trackRequestIsOpen}
        setTrackRequestIsOpen={setTrackRequestIsOpenCallback}
      />
      <AnimateToTrack
        sidebarIsOpen={sidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <HideNonSelectedVessels
        sidebarIsOpen={sidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <ShowFishingActivitiesOnMap
        sidebarIsOpen={sidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <TrackExport
        sidebarIsOpen={sidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <Wrapper
        data-cy={'vessel-sidebar'}
        healthcheckTextWarning={healthcheckTextWarning}
        sidebarIsOpen={sidebarIsOpen}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={rightMenuIsOpen}
      >
        <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !firstUpdate.current}/>
        <div>
          <TabList>
            {
              adminRole
                ? <Tab
                  isActive={vesselSidebarTab === VesselSidebarTab.SUMMARY}
                  onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.SUMMARY))}
                  data-cy={'vessel-menu-resume'}
                >
                  <SummaryIcon/> <br/> Résumé
                </Tab>
                : null
            }
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
              isActive={vesselSidebarTab === VesselSidebarTab.REPORTING}
              onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.REPORTING))}
              data-cy={'vessel-menu-reporting'}
            >
              <ReportingIcon/> <br/> Signalements
              {
                selectedVessel?.reportings?.length
                  ? <ReportingNumber hasInfractionSuspicion={selectedVessel?.hasInfractionSuspicion}>
                      {selectedVessel?.reportings?.length}
                  </ReportingNumber>
                  : null
              }

            </Tab>
            <Tab
              isActive={vesselSidebarTab === VesselSidebarTab.CONTROLS}
              onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.CONTROLS))}
              data-cy={'vessel-menu-controls'}
            >
              <ControlsIcon/> <br/> Contrôles
            </Tab>
            {
              adminRole
                ? <Tab
                  isLast
                  isActive={vesselSidebarTab === VesselSidebarTab.ERSVMS}
                  onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.ERSVMS))}
                  data-cy={'vessel-menu-ers-vms'}
                >
                  <VMSIcon/> <br/> VMS/ERS
                </Tab>
                : null
            }
          </TabList>
          <Panel healthcheckTextWarning={healthcheckTextWarning}>
            {
              adminRole
                ? <AlertWarning selectedVessel={selectedVessel}/>
                : null
            }
            {
              adminRole
                ? <BeaconMalfunctionWarning selectedVessel={selectedVessel}/>
                : null
            }
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
            {
              vesselSidebarTab === VesselSidebarTab.REPORTING
                ? <VesselReportings/>
                : null
            }
            {
              vesselSidebarTab === VesselSidebarTab.ERSVMS
                ? <VesselBeaconMalfunctions/>
                : null
            }
          </Panel>
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

const ReportingNumber = styled.span`
  background: ${props => props.hasInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal};
  border-radius: 10px;
  color: ${COLORS.background};
  position: absolute;
  top: 6px;
  right: 189px;
  width: 14px;
  height: 14px;
  line-height: 10px;
  font-weight: 700;
`

const Panel = styled.div`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${props => props.healthcheckTextWarning ? 80 : 82}vh;
`

const Tab = styled.button`
  padding-top: 5px;
  display: inline-block;
  width: 170px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 65px;
  font: normal normal 300 10px/14px Marianne;
  ${props => !props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null}
  background: ${props => props.isActive ? COLORS.shadowBlue : COLORS.charcoal};
  color: ${props => props.isActive ? COLORS.background : COLORS.lightGray};
  
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
  background: ${COLORS.gainsboro};
  overflow: hidden;
  opacity: ${props => props.sidebarIsOpen ? 1 : 0};
  margin-right: ${props => props.sidebarIsOpen ? 0 : -510}px;
  right: ${props => props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10}px;
  transition: all 0.5s, right 0.3s, opacity 0.5s;
`

const VesselIDIcon = styled(VesselIDSVG)`
  width: 30px;
`

const ControlsIcon = styled(ControlsSVG)`
  width: 30px;
`

const VMSIcon = styled(VMSSVG)`
  width: 30px;
`

const FisheriesIcon = styled(FisheriesSVG)`
  width: 30px;
`

const ReportingIcon = styled(ReportingSVG)`
  width: 30px;
`

const SummaryIcon = styled(SummarySVG)`
  width: 30px;
`

export default VesselSidebar
