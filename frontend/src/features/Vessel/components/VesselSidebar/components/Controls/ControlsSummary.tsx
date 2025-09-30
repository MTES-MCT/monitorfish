import { SidebarHeader, SidebarZone } from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { customDayjs, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { InfractionsSummary } from './InfractionsSummary'
import { LastControl } from './LastControl'
import { LawReminders } from './LawReminders'
// TODO Add the icon to https://github.com/MTES-MCT/monitor-ui
import CautionSVG from '../../../../../icons/Attention_controles.svg?react'
import SeaSVG from '../../../../../icons/Avarie_statut_navire_en_mer.svg?react'

import type { MissionAction } from '../../../../../Mission/missionAction.types'

type ControlsResumeZoneProps = {
  controlsFromDate: string
  lastControls: MissionAction.LastControls
  summary: MissionAction.MissionControlsSummary
}
export function ControlsSummary({ controlsFromDate, lastControls, summary }: ControlsResumeZoneProps) {
  const { controls, numberOfControlsWithSomeGearsSeized, numberOfControlsWithSomeSpeciesSeized, numberOfDiversions } =
    summary
  const yearsDepth = customDayjs().utc().get('year') - customDayjs(controlsFromDate).get('year') + 1

  return (
    <StyledSidebarZone data-cy="vessel-controls-summary">
      <SidebarHeader>Derniers contrôles ({yearsDepth} dernières années)</SidebarHeader>
      <Body>
        <InfractionsSummary
          numberOfControlsWithSomeGearsSeized={numberOfControlsWithSomeGearsSeized}
          numberOfControlsWithSomeSpeciesSeized={numberOfControlsWithSomeSpeciesSeized}
          numberOfDiversions={numberOfDiversions}
        />
        <Columns $isFirst>
          <IconColumn>
            <Sea />
          </IconColumn>
          <LastControl field={lastControls.SEA} />
        </Columns>
        <Columns $isFirst={false}>
          <IconColumn>
            <Icon.Anchor color="#ff3392" />
          </IconColumn>
          <LastControl field={lastControls.LAND} />
        </Columns>
        <Columns $isFirst={false}>
          <IconColumn>
            <Caution />
          </IconColumn>
          <LawReminders controls={controls} />
        </Columns>
      </Body>
    </StyledSidebarZone>
  )
}

const StyledSidebarZone = styled(SidebarZone)`
  margin: 10px 0 10px 0;
`

const Body = styled.div`
  margin: 0;
  padding: 8px 5px 14px 10px;
  width: 100%;
`

const Columns = styled.div<{
  $isFirst: boolean
}>`
  display: flex;
  margin-top: ${p => (p.$isFirst ? 6 : 12)}px;
`

const IconColumn = styled.div`
  margin-left: 6px;
  width: 30px;
  flex-shrink: 0;
`

const Sea = styled(SeaSVG)`
  vertical-align: sub;
  width: 20px;

  path {
    fill: #ff3392;
  }
`

const Caution = styled(CautionSVG)`
  vertical-align: sub;
  width: 20px;
`
