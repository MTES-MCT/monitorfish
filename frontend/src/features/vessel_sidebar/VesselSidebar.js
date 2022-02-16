import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as SummarySVG } from '../icons/Picto_resume.svg'
import { ReactComponent as VesselIDSVG } from '../icons/Picto_identite.svg'
import { ReactComponent as FisheriesSVG } from '../icons/Picto_peche.svg'
import { ReactComponent as ControlsSVG } from '../icons/Picto_controles.svg'
import { ReactComponent as ObservationsSVG } from '../icons/Picto_ciblage.svg'
import { ReactComponent as VMSSVG } from '../icons/Icone_VMS_fiche_navire.svg'
import VesselIdentity from './VesselIdentity'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import VesselSummary from './VesselSummary'
import VesselFishingActivities from './fishing_activities/VesselFishingActivities'
import { showVesselSidebarTab } from '../../domain/shared_slices/Vessel'
import VesselControls from './controls/VesselControls'
import TrackDepthSelection from './actions/track_depth_selection/TrackDepthSelection'
import TrackExport from './actions/track_export/TrackExport'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { VesselSidebarTab } from '../../domain/entities/vessel'
import HideNonSelectedVessels from './actions/hide_non_selected_vessels/HideNonSelectedVessels'
import AnimateToTrack from './actions/animate_to_track/AnimateToTrack'
import ShowFishingActivitiesOnMap from './actions/show_fishing_activities/ShowFishingActivitiesOnMap'
import AlertWarning from './warnings/AlertWarning'
import BeaconStatusWarning from './warnings/BeaconStatusWarning'

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

  const [openSidebar, setOpenSidebar] = useState(false)
  const firstUpdate = useRef(true)
  const [trackDepthSelectionIsOpen, setTrackDepthSelectionIsOpen] = useState(false)

  useEffect(() => {
    if (openSidebar === true) {
      firstUpdate.current = false
    } else {
      setTrackDepthSelectionIsOpen(false)
    }
  }, [openSidebar])

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
        rightMenuIsOpen={rightMenuIsOpen}
        trackDepthSelectionIsOpen={trackDepthSelectionIsOpen}
        setTrackDepthSelectionIsOpen={setTrackDepthSelectionIsOpen}
      />
      <AnimateToTrack
        openBox={openSidebar}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <HideNonSelectedVessels
        openBox={openSidebar}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <ShowFishingActivitiesOnMap
        openBox={openSidebar}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <TrackExport
        openBox={openSidebar}
        rightMenuIsOpen={rightMenuIsOpen}
      />
      <Wrapper
        data-cy={'vessel-sidebar'}
        healthcheckTextWarning={healthcheckTextWarning}
        openBox={openSidebar}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={rightMenuIsOpen}
      >
        <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !firstUpdate.current}/>
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
          <Panel healthcheckTextWarning={healthcheckTextWarning}>
            <AlertWarning selectedVessel={selectedVessel}/>
            <BeaconStatusWarning selectedVessel={selectedVessel}/>
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

const Panel = styled.div`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${props => props.healthcheckTextWarning ? 80 : 82}vh;
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
  background: ${COLORS.gainsboro};
  overflow: hidden;
  margin-right: ${props => props.openBox ? 0 : -510}px;
  right: ${props => props.rightMenuIsOpen && props.openBox ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;
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
