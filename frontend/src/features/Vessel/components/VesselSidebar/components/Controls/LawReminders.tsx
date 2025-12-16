import { Accent, Tag } from '@mtes-mct/monitor-ui'
import { pluralize } from '@utils/pluralize'
import { uniqWith } from 'lodash-es'
import styled from 'styled-components'

import {
  getInfractionTitle,
  getNumberOfInfractionsWithoutRecord,
  infractionWithoutRecordFilter
} from '../../../../../../domain/entities/controls'

import type { MissionAction } from '@features/Mission/missionAction.types'

type LawRemindersProps = {
  controls: MissionAction.MissionAction[]
}

export function LawReminders({ controls }: LawRemindersProps) {
  const infractionsWithoutRecord = controls.reduce(
    (accumulator, control) => accumulator + getNumberOfInfractionsWithoutRecord(control),
    0
  )

  const infractions = controls.map(control => control.infractions.filter(infractionWithoutRecordFilter)).flat()

  const natinfTags = uniqWith(infractions, (a, b) => a.natinf === b.natinf && a.threat === b.threat).map(infraction => (
    <StyledTag key={infraction.natinf} accent={Accent.PRIMARY} title={getInfractionTitle(infraction)}>
      {infraction.threat} / NATINF {infraction.natinf}
    </StyledTag>
  ))

  return (
    <Fields data-cy="vessel-controls-summary-law-reminders">
      <Row isGrey isStrong={false}>
        {!infractionsWithoutRecord && 'Aucun rappel à la loi'}
        {infractionsWithoutRecord > 0 && 'Rappels à la loi'}
      </Row>
      {infractionsWithoutRecord > 0 && (
        <Row isGrey={false} isStrong>
          {infractionsWithoutRecord} {pluralize('infraction', infractionsWithoutRecord)} sans PV <GoldenPoppy />
          <br />
          {natinfTags}
        </Row>
      )}
    </Fields>
  )
}

const Fields = styled.div`
  margin: 0;
  width: 100%;
`

const Row = styled.div<{
  isGrey: boolean
  isStrong: boolean
}>`
  margin: 0 2px 2px 0;
  width: 100%;
  color: ${p => (p.isGrey ? p.theme.color.slateGray : 'unset')};
  font-weight: ${p => (p.isStrong ? 500 : 'unset')};
`

const GoldenPoppy = styled.span`
  height: 8px;
  width: 8px;
  margin: 0 5px 0 5px;
  background-color: ${p => p.theme.color.goldenPoppy};
  border-radius: 50%;
  display: inline-block;
`

const StyledTag = styled(Tag)`
  margin-top: 8px;
  margin-right: 8px;
`
