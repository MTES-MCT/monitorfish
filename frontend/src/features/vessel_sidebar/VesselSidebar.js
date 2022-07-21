import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

  const isFirstLoad = useRef(true)
  const [isTrackRequestOpen, setIsTrackRequestOpen] = useState(false)
  const [sidebarIsShowed, setSidebarIsShowed] = useState(false)

  useEffect(() => {
    isFirstLoad.current = false
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setSidebarIsShowed(vesselSidebarIsOpen)
    }, 0)
  }, [vesselSidebarIsOpen])

  return vesselSidebarIsOpen && <>
    <AddToFavorites
      sidebarIsOpen={sidebarIsShowed}
      rightMenuIsOpen={rightMenuIsOpen}
    />
    {sidebarIsShowed && <TrackRequest
      isRightMenuOpen={rightMenuIsOpen}
      isTrackRequestOpen={isTrackRequestOpen}
      setIsTrackRequestOpen={setIsTrackRequestOpen}
    />}
    <AnimateToTrack
      sidebarIsOpen={sidebarIsShowed}
      rightMenuIsOpen={rightMenuIsOpen}
    />
    <HideNonSelectedVessels
      sidebarIsOpen={sidebarIsShowed}
      rightMenuIsOpen={rightMenuIsOpen}
    />
    <ShowFishingActivitiesOnMap
      sidebarIsOpen={sidebarIsShowed}
      rightMenuIsOpen={rightMenuIsOpen}
    />
    <TrackExport
      sidebarIsOpen={sidebarIsShowed}
      rightMenuIsOpen={rightMenuIsOpen}
    />
    <Wrapper
      data-cy={'vessel-sidebar'}
      healthcheckTextWarning={healthcheckTextWarning}
      sidebarIsOpen={sidebarIsShowed}
      firstUpdate={isFirstLoad.current}
      rightMenuIsOpen={rightMenuIsOpen}
    >
      <GrayOverlay isOverlayed={isFocusedOnVesselSearch && !isFirstLoad.current}/>
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
          {
            adminRole
              ? <Tab
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
              : null
          }
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
}

const GrayOverlay = styled.div`
  animation: ${p => p.isOverlayed ? 'opacity-up' : 'opacity-down'} 0.5s ease forwards;
  background: ${COLORS.charcoal};
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;
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
  background: ${p => p.hasInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal};
  border-radius: 10px;
  color: ${COLORS.background};
  position: absolute;
  top: 6px;
  right: 189px;
  width: 14px;
  height: 14px;
  line-height: 13px;
  font-weight: 700;
`

const Panel = styled.div`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${p => p.healthcheckTextWarning ? 80 : 82}vh;
`

const Tab = styled.button`
  ${p => !p.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null}
  background: ${p => p.isActive ? COLORS.shadowBlue : COLORS.charcoal};
  border-radius: 0;
  border: none;
  color: ${p => p.isActive ? COLORS.background : COLORS.lightGray};
  display: inline-block;
  font: normal normal 300 10px/14px Marianne;
  height: 65px;
  margin: 0;
  padding-top: 5px;
  width: 170px;

  :hover, :focus, :active {
    background: ${COLORS.shadowBlue};
    ${p => !p.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null}
  }
`

const TabList = styled.div`
  background: ${COLORS.charcoal};
  border-top: 1px solid ${COLORS.lightGray};
  display: flex;
`

const Wrapper = styled(MapComponentStyle)`
  background: ${COLORS.gainsboro};
  margin-right: ${p => p.sidebarIsOpen ? 0 : -510}px;
  max-height: 93vh;
  opacity: ${p => p.sidebarIsOpen ? 1 : 0};
  overflow: hidden;
  padding: 0;
  position: absolute;
  right: ${p => p.rightMenuIsOpen && p.sidebarIsOpen ? 55 : 10}px;
  top: 50px;
  transition: all 0.5s, right 0.3s, opacity 0.3s;
  width: 500px;
  z-index: 999;
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
