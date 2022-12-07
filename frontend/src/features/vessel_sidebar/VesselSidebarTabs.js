import React from 'react'
import styled from 'styled-components'
import { ReactComponent as SummarySVG } from '../icons/Picto_resume.svg'
import { ReactComponent as VesselIDSVG } from '../icons/Picto_identite.svg'
import { ReactComponent as FisheriesSVG } from '../icons/Picto_peche.svg'
import { ReactComponent as ControlsSVG } from '../icons/Picto_controles.svg'
import { ReactComponent as ReportingSVG } from '../icons/Icone_onglet_signalement.svg'
import { ReactComponent as VMSSVG } from '../icons/Icone_VMS_fiche_navire.svg'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import { showVesselSidebarTab } from '../../domain/shared_slices/Vessel'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'

const VesselSidebarTabs = () => {
  const dispatch = useDispatch()
  const {
    selectedVessel,
    vesselSidebarTab
  } = useSelector(state => state.vessel)
  const isAdmin = useSelector(state => state.global.isAdmin)

  return (
    <TabList>
      {
        isAdmin
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
        isAdmin
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
        isAdmin
          ? <Tab
            isLast
            isActive={vesselSidebarTab === VesselSidebarTab.ERSVMS}
            onClick={() => dispatch(showVesselSidebarTab(VesselSidebarTab.ERSVMS))}
            data-cy={'vessel-menu-ers-vms'}
          >
            <VMSIcon/> <br/> VMS
          </Tab>
          : null
      }
    </TabList>
  )
}

const ReportingNumber = styled.span`
  background: ${props => props.hasInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal};
  border-radius: 10px;
  color: ${p => p.theme.color.white};
  position: absolute;
  top: 6px;
  right: 189px;
  width: 14px;
  height: 14px;
  line-height: 13px;
  font-weight: 700;
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
  background: ${props => props.isActive ? props.theme.color.blueGray[100] : props.theme.color.charcoal};
  color: ${props => props.isActive ? props.theme.color.white : props.theme.color.lightGray};

  :hover, :focus, :active {
    background: ${p => p.theme.color.blueGray[100]};
    ${props => !props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null}
  }
`

const TabList = styled.div`
  display: flex;
  background: ${COLORS.charcoal};
  border-top: 1px solid ${COLORS.lightGray};
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

export default VesselSidebarTabs
