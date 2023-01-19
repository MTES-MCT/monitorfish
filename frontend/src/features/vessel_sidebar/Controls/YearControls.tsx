import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { YearListChevronIcon, YearListContent, YearListTitle, YearListTitleText } from '../common_styles/YearList.style'
import { Control } from './Control'

import type { MissionAction } from '../../../domain/types/missionAction'

type YearControlsProps = {
  year: number
  yearControls: MissionAction[]
}
export function YearControls({ year, yearControls }: YearControlsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isEmpty = yearControls.length === 0

  const numberOfInfractions = useMemo(
    () => yearControls.reduce((accumulator, control) => accumulator + getNumberOfInfractions(control), 0),
    [yearControls]
  )

  const sortedControls = useMemo(
    () =>
      yearControls.sort((a, b) => new Date(b.actionDatetimeUtc).getTime() - new Date(a.actionDatetimeUtc).getTime()),
    [yearControls]
  )

  return (
    yearControls && (
      <Row>
        <YearListTitle isEmpty={isEmpty} isOpen={isOpen}>
          <YearListTitleText isEmpty={isEmpty} onClick={() => !isEmpty && setIsOpen(!isOpen)} title={year.toString()}>
            {!isEmpty && <YearListChevronIcon $isOpen={isOpen} />}
            <Year>{year}</Year>
            <YearResume data-cy="vessel-controls-year">
              {!isEmpty ? (
                <>
                  {yearControls.length} contrôle{yearControls.length > 1 ? 's' : ''}
                </>
              ) : (
                'Pas de contrôle'
              )}
              {numberOfInfractions ? (
                <>
                  , {numberOfInfractions} infraction{numberOfInfractions > 1 ? 's' : ''} <Red />
                </>
              ) : (
                <>
                  , pas d&apos;infraction <Green />
                </>
              )}
            </YearResume>
          </YearListTitleText>
        </YearListTitle>
        <YearListContent isOpen={isOpen} name={year.toString()}>
          {sortedControls.map((control, index) => (
            <Control key={control.actionDatetimeUtc} control={control} isLastItem={yearControls.length === index + 1} />
          ))}
        </YearListContent>
      </Row>
    )
  )
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const Green = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: ${COLORS.mediumSeaGreen};
  border-radius: 50%;
  display: inline-block;
`

const Year = styled.span`
  color: ${COLORS.slateGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${COLORS.gunMetal};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
`

const Row = styled.div`
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  background: ${COLORS.white};
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  line-height: 1.9em;
`
