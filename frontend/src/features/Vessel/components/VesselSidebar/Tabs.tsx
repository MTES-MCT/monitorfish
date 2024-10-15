import { setSelectedVesselSidebarTab } from '@features/Vessel/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Figure } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { forbiddenVesselSidebarPaths } from 'domain/entities/authorization/constants'
import { VesselSidebarTab } from 'domain/entities/vessel/vessel'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { useEffect } from 'react'
import styled from 'styled-components'

import ReportingSVG from '../../../icons/Icone_onglet_signalement.svg?react'
import VMSSVG from '../../../icons/Icone_VMS_fiche_navire.svg?react'
import ControlsSVG from '../../../icons/Picto_controles.svg?react'
import VesselIDSVG from '../../../icons/Picto_identite.svg?react'
import FisheriesSVG from '../../../icons/Picto_peche.svg?react'
import SummarySVG from '../../../icons/Picto_resume.svg?react'

// TODO Move the icons in Monitor UI : https://github.com/MTES-MCT/monitorfish/issues/1736
export function Tabs() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselSidebarTab = useMainAppSelector(state => state.vessel.selectedVesselSidebarTab)

  useEffect(() => {
    if (!isSuperUser && forbiddenVesselSidebarPaths.includes(selectedVesselSidebarTab)) {
      dispatch(setSelectedVesselSidebarTab(VesselSidebarTab.IDENTITY))
    }
  }, [dispatch, isSuperUser, selectedVesselSidebarTab])

  function showTab(tab: VesselSidebarTab) {
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    dispatch(setSelectedVesselSidebarTab(tab))
  }

  return (
    <TabList>
      <Tab
        $isActive={selectedVesselSidebarTab === VesselSidebarTab.SUMMARY}
        data-cy="vessel-menu-summary"
        onClick={() => showTab(VesselSidebarTab.SUMMARY)}
      >
        <SummaryIcon /> <br /> Résumé
      </Tab>
      <Tab
        $isActive={selectedVesselSidebarTab === VesselSidebarTab.IDENTITY}
        data-cy="vessel-menu-identity"
        onClick={() => showTab(VesselSidebarTab.IDENTITY)}
      >
        <VesselIDIcon /> <br /> Identité
      </Tab>
      <Tab
        $isActive={selectedVesselSidebarTab === VesselSidebarTab.VOYAGES}
        data-cy="vessel-menu-fishing"
        onClick={() => showTab(VesselSidebarTab.VOYAGES)}
      >
        <FisheriesIcon /> <br /> Pêche
      </Tab>
      {isSuperUser && (
        <Tab
          $isActive={selectedVesselSidebarTab === VesselSidebarTab.REPORTING}
          data-cy="vessel-menu-reporting"
          onClick={() => showTab(VesselSidebarTab.REPORTING)}
        >
          <ReportingIcon /> <br /> Signalements
          {!!selectedVessel?.reportings?.length && (
            <BadgeNumber $hasInfractionSuspicion={selectedVessel?.hasInfractionSuspicion}>
              <Figure>{selectedVessel?.reportings?.length}</Figure>
            </BadgeNumber>
          )}
        </Tab>
      )}
      <Tab
        $isActive={selectedVesselSidebarTab === VesselSidebarTab.CONTROLS}
        data-cy="vessel-menu-controls"
        onClick={() => showTab(VesselSidebarTab.CONTROLS)}
      >
        <ControlsIcon /> <br /> Contrôles
      </Tab>
      <Tab
        $isActive={selectedVesselSidebarTab === VesselSidebarTab.ERSVMS}
        $isLast
        data-cy="vessel-menu-ers-vms"
        onClick={() => showTab(VesselSidebarTab.ERSVMS)}
      >
        <VMSIcon /> <br /> VMS/JPE
      </Tab>
    </TabList>
  )
}

const BadgeNumber = styled.div<{
  $hasInfractionSuspicion: boolean
}>`
  display: inline-block;
  position: absolute;
  height: 15px;
  padding: 0 4.25px;
  text-align: center;
  border-radius: 10px;
  top: 6px;
  line-height: 14px;
  background: ${p => (p.$hasInfractionSuspicion ? p.theme.color.maximumRed : p.theme.color.gunMetal)};
  color: ${p => p.theme.color.white};
  font-size: 11px;
  letter-spacing: 0px;
  font-weight: 700;
  margin-left: -30px;
`

const Tab = styled.button<{
  $isActive: boolean
  $isLast?: boolean
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
  ${p => (!p.$isLast ? `border-right: 1px solid ${p.theme.color.lightGray};` : null)}
  background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  color: ${p => (p.$isActive ? p.theme.color.white : p.theme.color.lightGray)};
  &:hover,
  &:focus {
    color: ${p => p.theme.color.white};
    background: ${p => p.theme.color.blueYonder};
    ${p => (!p.$isLast ? `border-right: 1px solid ${p.theme.color.lightGray};` : null)}
  }

  &:active {
    color: ${p => p.theme.color.white};
    background: ${p => p.theme.color.blueGray};
    ${p => (!p.$isLast ? `border-right: 1px solid ${p.theme.color.lightGray};` : null)}
  }
`

const TabList = styled.div`
  display: flex;
  background: ${p => p.theme.color.charcoal};
  border-top: 1px solid ${p => p.theme.color.lightGray};
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
