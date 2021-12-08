import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as SummarySVG } from '../icons/Picto_resume.svg'
import { ReactComponent as VesselIDSVG } from '../icons/Picto_identite.svg'
import { ReactComponent as FisheriesSVG } from '../icons/Picto_peche.svg'
import { ReactComponent as ControlsSVG } from '../icons/Picto_controles.svg'
import { ReactComponent as ObservationsSVG } from '../icons/Picto_ciblage.svg'
import { ReactComponent as VMSSVG } from '../icons/Icone_VMS_fiche_navire.svg'
import VesselIdentity from './VesselIdentity'
import { batch, useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import VesselSummary from './VesselSummary'
import VesselFishingActivities from './fishing_activities/VesselFishingActivities'
import { showVesselSidebarTab } from '../../domain/shared_slices/Vessel'
import VesselControls from './controls/VesselControls'
import TrackDepthSelection from './actions/track_depth_selection/TrackDepthSelection'
import TrackExport from './actions/track_export/TrackExport'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { VesselSidebarTab } from '../../domain/entities/vessel'
import HideOtherVessels from './actions/hide_other_vessels/HideOtherVessels'
import AnimateToTrack from './actions/animate_to_track/AnimateToTrack'
import ShowFishingActivitiesOnMap from './actions/show_fishing_activities/ShowFishingActivitiesOnMap'
import { getAlertNameFromType } from '../../domain/entities/alerts'
import { focusOnAlert, openAlertList } from '../../domain/shared_slices/Alert'
import { ReactComponent as AlertSVG } from '../icons/Icone_alertes.svg'

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
      <HideOtherVessels
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
        {
          <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !firstUpdate.current}/>
        }
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
            {
              selectedVessel?.alerts.length
                ? <VesselCardAlerts
                  onClick={() => {
                    batch(() => {
                      dispatch(openAlertList())
                      dispatch(focusOnAlert({
                        name: selectedVessel?.alerts[0],
                        internalReferenceNumber: selectedVessel.internalReferenceNumber,
                        externalReferenceNumber: selectedVessel.externalReferenceNumber,
                        ircs: selectedVessel.ircs
                      }))
                    })
                  }}
                  data-cy={'vessel-sidebar-alert'}
                >
                  <AlertIcon/>
                  {
                    selectedVessel?.alerts.length === 1
                      ? getAlertNameFromType(selectedVessel?.alerts[0])
                      : `${selectedVessel?.alerts.length} alertes`
                  }
                  <SeeAlert>
                    {
                      selectedVessel?.alerts.length === 1
                        ? 'Voir l\'alerte dans la liste'
                        : 'Voir les alertes dans la liste'
                    }
                  </SeeAlert>
                </VesselCardAlerts>
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
          </Panel>
        </div>
      </Wrapper>
    </>
  )
}

const SeeAlert = styled.span`
  font-size: 11px;
  float: right;
  margin-right: 10px;
  text-decoration: underline;
  text-transform: lowercase;
  line-height: 17px;
`

const AlertIcon = styled(AlertSVG)`
  width: 18px;
  height: 18px;
  margin-bottom: -4px;
  margin-right: 5px;
  margin-left: 7px;
  
  animation: ring 4s .7s ease-in-out;
  animation-iteration-count: 1;
  transform-origin: 50% 4px;
  
  @keyframes ring {
    0% { transform: rotate(0); }
    1% { transform: rotate(30deg); }
    3% { transform: rotate(-28deg); }
    5% { transform: rotate(34deg); }
    7% { transform: rotate(-32deg); }
    9% { transform: rotate(30deg); }
    11% { transform: rotate(-28deg); }
    13% { transform: rotate(26deg); }
    15% { transform: rotate(-24deg); }
    17% { transform: rotate(22deg); }
    19% { transform: rotate(-20deg); }
    21% { transform: rotate(18deg); }
    23% { transform: rotate(-16deg); }
    25% { transform: rotate(14deg); }
    27% { transform: rotate(-12deg); }
    29% { transform: rotate(10deg); }
    31% { transform: rotate(-8deg); }
    33% { transform: rotate(6deg); }
    35% { transform: rotate(-4deg); }
    37% { transform: rotate(2deg); }
    39% { transform: rotate(-1deg); }
    41% { transform: rotate(1deg); }
    43% { transform: rotate(0); }
    100% { transform: rotate(0); }
  }
`

const VesselCardAlerts = styled.div`
  cursor: pointer;
  background: #E1000F;
  font-weight: 500;
  font-size: 13px;
  color: #FFFFFF;
  text-transform: uppercase;
  width: 100%;
  text-align: left;
  padding: 5px 0;
  margin-top: 1px;
`

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
  max-height: ${props => props.healthcheckTextWarning ? 77 : 82}vh;
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
