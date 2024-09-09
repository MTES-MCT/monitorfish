import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { useEffect } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { COLORS } from '../../../../constants/constants'
import { forbiddenVesselSidebarPaths } from '../../../../domain/entities/authorization/constants'
import { VesselSidebarTab } from '../../../../domain/entities/vessel/vessel'
import { displayedErrorActions } from '../../../../domain/shared_slices/DisplayedError'
import { showVesselSidebarTab } from '../../../../domain/shared_slices/Vessel'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import ReportingSVG from '../icons/Icone_onglet_signalement.svg?react'
import VMSSVG from '../icons/Icone_VMS_fiche_navire.svg?react'
import ControlsSVG from '../icons/Picto_controles.svg?react'
import VesselIDSVG from '../icons/Picto_identite.svg?react'
import FisheriesSVG from '../icons/Picto_peche.svg?react'
import SummarySVG from '../icons/Picto_resume.svg?react'

// TODO Move the icons in Monitor UI : https://github.com/MTES-MCT/monitorfish/issues/1736
export function Tabs() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const vesselSidebarTab = useMainAppSelector(state => state.vessel.vesselSidebarTab)

  useEffect(() => {
    if (!isSuperUser && forbiddenVesselSidebarPaths.includes(vesselSidebarTab)) {
      dispatch(showVesselSidebarTab(VesselSidebarTab.IDENTITY))
    }
  }, [dispatch, isSuperUser, vesselSidebarTab])

  function showTab(tab: VesselSidebarTab) {
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    dispatch(showVesselSidebarTab(tab))
  }

  return (
    <TabList>
      <Tab
        data-cy="vessel-menu-summary"
        isActive={vesselSidebarTab === VesselSidebarTab.SUMMARY}
        onClick={() => showTab(VesselSidebarTab.SUMMARY)}
      >
        <SummaryIcon /> <br /> Résumé
      </Tab>
      <Tab
        data-cy="vessel-menu-identity"
        isActive={vesselSidebarTab === VesselSidebarTab.IDENTITY}
        onClick={() => showTab(VesselSidebarTab.IDENTITY)}
      >
        <VesselIDIcon /> <br /> Identité
      </Tab>
      <Tab
        data-cy="vessel-menu-fishing"
        isActive={vesselSidebarTab === VesselSidebarTab.VOYAGES}
        onClick={() => showTab(VesselSidebarTab.VOYAGES)}
      >
        <FisheriesIcon /> <br /> Pêche
      </Tab>
      {isSuperUser && (
        <Tab
          data-cy="vessel-menu-reporting"
          isActive={vesselSidebarTab === VesselSidebarTab.REPORTING}
          onClick={() => showTab(VesselSidebarTab.REPORTING)}
        >
          <ReportingIcon /> <br /> Signalements
          {!!selectedVessel?.reportings?.length && (
            <ReportingNumber hasInfractionSuspicion={selectedVessel?.hasInfractionSuspicion}>
              {selectedVessel?.reportings?.length}
            </ReportingNumber>
          )}
        </Tab>
      )}
      <Tab
        data-cy="vessel-menu-controls"
        isActive={vesselSidebarTab === VesselSidebarTab.CONTROLS}
        onClick={() => showTab(VesselSidebarTab.CONTROLS)}
      >
        <ControlsIcon /> <br /> Contrôles
      </Tab>
      <Tab
        data-cy="vessel-menu-ers-vms"
        isActive={vesselSidebarTab === VesselSidebarTab.ERSVMS}
        isLast
        onClick={() => showTab(VesselSidebarTab.ERSVMS)}
      >
        <VMSIcon /> <br /> VMS/JPE
      </Tab>
    </TabList>
  )
}

const ReportingNumber = styled.span<{
  hasInfractionSuspicion: boolean
}>`
  background: ${props => (props.hasInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal)};
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

const Tab = styled.button<{
  isActive: boolean
  isLast?: boolean
}>`
  padding-top: 5px;
  display: inline-block;
  width: 170px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 65px;
  font: normal normal 300 10px/14px Marianne;
  letter-spacing: 0.45px;
  ${props => (!props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null)}
  background: ${props => (props.isActive ? props.theme.color.blueGray : props.theme.color.charcoal)};
  color: ${props => (props.isActive ? props.theme.color.white : props.theme.color.lightGray)};
  &:hover,
  &:focus {
    color: ${p => p.theme.color.white};
    background: ${p => p.theme.color.blueYonder};
    ${props => (!props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null)}
  }

  &:active {
    color: ${p => p.theme.color.white};
    background: ${p => p.theme.color.blueGray};
    ${props => (!props.isLast ? `border-right: 1px solid ${COLORS.lightGray};` : null)}
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
