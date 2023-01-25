import { useMemo } from 'react'
import styled from 'styled-components'

import { Green, Red } from './Controls.style'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { getDate } from '../../../utils'

import type { ControlAndText } from '../../../domain/types/missionAction'

type LastControlProps = {
  field: ControlAndText
}
export function LastControl({ field }: LastControlProps) {
  const { control, text } = field
  const controlUnits = control?.controlUnits.map(controlUnit => controlUnit.name).join(', ') || 'Unité manquante'

  const numberOfInfractions = useMemo(() => getNumberOfInfractions(control), [control])

  return (
    <Fields data-cy="vessel-controls-summary-last-control">
      <Row isGrey isStrong={false}>
        {!control && 'Aucun '}
        {control ? text : text.replace('Dernier', '')}
      </Row>
      {control && (
        <Row isGrey={false} isStrong>
          Le {getDate(control.actionDatetimeUtc)} ({controlUnits}),{' '}
          {numberOfInfractions ? (
            <>
              {' '}
              {numberOfInfractions} infraction{numberOfInfractions > 1 ? 's' : ''}
              <Red />
            </>
          ) : (
            <>
              pas d&apos;infraction
              <Green />
            </>
          )}
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
