import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Control } from './Control'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { YearListChevronIcon, YearListContent, YearListTitle, YearListTitleText } from '../common_styles/YearList.style'

import type { MissionAction } from '../../../domain/types/missionAction'

type YearControlsProps = {
  year: number
  yearControls: MissionAction.MissionAction[]
}
export function YearControls({ year, yearControls }: YearControlsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isEmpty = yearControls.length === 0

  const numberOfInfractionsText = useMemo(() => {
    const numberOfInfractions = yearControls.reduce(
      (accumulator, control) => accumulator + getNumberOfInfractions(control),
      0
    )

    if (isEmpty) {
      return null
    }

    if (!numberOfInfractions) {
      return (
        <>
          , pas d&apos;infraction <Green />
        </>
      )
    }

    return (
      <>
        , {numberOfInfractions} infraction{numberOfInfractions > 1 ? 's' : ''} <Red />
      </>
    )
  }, [yearControls, isEmpty])

  const sortedControls = useMemo(
    () =>
      yearControls.sort((a, b) =>
        a.actionDatetimeUtc && b.actionDatetimeUtc && a.actionDatetimeUtc > b.actionDatetimeUtc ? 1 : -1
      ),
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
                'Aucun contrôle'
              )}
              {numberOfInfractionsText}
            </YearResume>
          </YearListTitleText>
        </YearListTitle>
        <YearListContent isOpen={isOpen} name={year.toString()}>
          {sortedControls.map(
            (control, index) =>
              control && <Control key={control.id} control={control} isLastItem={yearControls.length === index + 1} />
          )}
        </YearListContent>
      </Row>
    )
  )
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: ${p => p.theme.color.maximumRed};
  border-radius: 50%;
  display: inline-block;
`

const Green = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: ${p => p.theme.color.mediumSeaGreen};
  border-radius: 50%;
  display: inline-block;
`

const Year = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-size: 16px;
  width: 39px;
  display: inline-block;
`

const YearResume = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-left: 15px;
`

const Row = styled.div`
  margin: 0;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`
