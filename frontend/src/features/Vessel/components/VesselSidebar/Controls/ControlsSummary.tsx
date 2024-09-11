import { customDayjs, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'
import { theme } from 'ui/theme'

import { InfractionsSummary } from './InfractionsSummary'
import { LastControl } from './LastControl'
import { LawReminders } from './LawReminders'
// TODO Add the icon to https://github.com/MTES-MCT/monitor-ui
import CautionSVG from '../../../../icons/Attention_controles.svg?react'
import SeaSVG from '../../../../icons/Avarie_statut_navire_en_mer.svg?react'
import { Header, Zone } from '../common_styles/common.style'

import type { MissionAction } from '../../../../Mission/missionAction.types'
import type { Dayjs } from 'dayjs'

type ControlsResumeZoneProps = {
  controlsFromDate: Dayjs
  lastControls: MissionAction.LastControls
  summary: MissionAction.MissionControlsSummary
}
export function ControlsSummary({ controlsFromDate, lastControls, summary }: ControlsResumeZoneProps) {
  const { controls, numberOfControlsWithSomeGearsSeized, numberOfControlsWithSomeSpeciesSeized, numberOfDiversions } =
    summary
  const yearsDepth = customDayjs().utc().get('year') - controlsFromDate.get('year') + 1

  return (
    <Zone data-cy="vessel-controls-summary">
      <Header>Derniers contrôles {controlsFromDate && <>({yearsDepth} dernières années)</>}</Header>
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
            <Icon.Anchor color={theme.color.slateGray} />
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
    </Zone>
  )
}

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
    fill: ${p => p.theme.color.slateGray};
  }
`

const Caution = styled(CautionSVG)`
  vertical-align: sub;
  width: 20px;
`
