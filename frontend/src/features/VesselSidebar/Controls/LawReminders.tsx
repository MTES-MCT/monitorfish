import { uniq } from 'lodash/fp'
import styled from 'styled-components'

import {
  getNumberOfInfractionsWithoutRecord,
  getNatinfForInfractionsWithoutRecord
} from '../../../domain/entities/controls'
import { pluralize } from '../../../utils/pluralize'

import type { MissionAction } from '../../../domain/types/missionAction'

type LawRemindersProps = {
  controls: MissionAction.MissionAction[]
}

export function LawReminders({ controls }: LawRemindersProps) {
  const infractionsWithoutRecord = controls.reduce(
    (accumulator, control) => accumulator + getNumberOfInfractionsWithoutRecord(control),
    0
  )

  const natinfs: number[] = controls.map(control => getNatinfForInfractionsWithoutRecord(control)).flat()

  const natinfTags = uniq(natinfs).map(natinf => (
    <InfractionTag key={natinf}>
      <InfractionTagText>NATINF {natinf}</InfractionTagText>
    </InfractionTag>
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
          {natinfTags}
        </Row>
      )}
    </Fields>
  )
}

const Fields = styled.div`
  width: 100%;
  margin: 0;
  line-height: 0.2em;
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

const InfractionTag = styled.span`
  margin: 5px 8px 0px 0px;
  background: ${p => p.theme.color.gainsboro};
  border-radius: 11px;
  font-size: 11px;
  height: 20px;
  display: inline-block;
  vertical-align: bottom;
`

const InfractionTagText = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin: 0 8px 0 8px;
  font-weight: 500;
`
