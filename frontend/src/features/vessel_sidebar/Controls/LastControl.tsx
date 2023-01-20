import { useMemo } from 'react'
import styled from 'styled-components'

import { Green, Red } from './Controls.style'
import { COLORS } from '../../../constants/constants'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { getDate } from '../../../utils'
import { NoValue, StrongText } from '../common_styles/common.style'

import type { ControlAndText, MissionActionType } from '../../../domain/types/missionAction'

type LastControlProps = {
  field: ControlAndText
  isFirst: boolean
  type: MissionActionType
}
export function LastControl({ field, isFirst, type }: LastControlProps) {
  const { control, text } = field
  const controlUnitName = control?.controlUnits[0]?.name || ''

  const numberOfInfractions = useMemo(() => getNumberOfInfractions(control), [control])

  return (
    <Fields key={type} isFirst={isFirst}>
      <ControlResumeLine>
        <ResumeText isFirst={isFirst}>
          {!control && 'Aucun '}
          {control ? text : text.replace('Dernier', '')}
          <StrongText data-cy="vessel-controls-last-control-date">
            {control && <>le {getDate(control.actionDatetimeUtc)}</>}
          </StrongText>
        </ResumeText>
      </ControlResumeLine>
      {control && (
        <ControlResumeLine>
          <LastControlResumeElement data-cy="vessel-controls-last-control-unit">
            Unité <StrongText title={controlUnitName}>{controlUnitName || <NoValue>-</NoValue>}</StrongText>
          </LastControlResumeElement>
          <LastControlResumeElement data-cy="vessel-controls-last-control-infractions">
            Infractions{' '}
            <StrongText>
              {numberOfInfractions ? (
                <>
                  {' '}
                  {numberOfInfractions} infraction{numberOfInfractions > 1 ? 's' : ''}
                  <Red />
                </>
              ) : (
                <>
                  Pas d&apos;infraction
                  <Green />
                </>
              )}
            </StrongText>
          </LastControlResumeElement>
        </ControlResumeLine>
      )}
    </Fields>
  )
}

const LastControlResumeElement = styled.span`
  margin-right: 10px;
`

const ResumeText = styled.span<{
  isFirst: boolean
}>`
  margin: ${p => (p.isFirst ? '5px' : '0')} 0 0 0;
`

const Fields = styled.div<{
  isFirst: boolean
}>`
  padding: ${p => (p.isFirst ? '10px' : '0')} 5px ${p => (p.isFirst ? '5px' : '10px')} 20px;
  width: 100%;
  margin: 0;
  line-height: 0.2em;
`

const ControlResumeLine = styled.div`
  margin: 0 5px 5px 0;
  border: none;
  background: none;
  font-size: 13px;
  color: ${COLORS.slateGray};
  display: flex;
  width: 100%;
`
