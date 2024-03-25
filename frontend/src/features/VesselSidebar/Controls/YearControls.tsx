import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Control } from './Control'
import {
  getNumberOfInfractions,
  getNumberOfInfractionsWithoutRecord,
  getNumberOfInfractionsWithRecord
} from '../../../domain/entities/controls'
import { pluralize } from '../../../utils/pluralize'
import { YearListChevronIcon, YearListContent, YearListTitle, YearListTitleText } from '../common_styles/YearList.style'

import type { MissionAction } from '../../Mission/missionAction.types'

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

    const numberOfInfractionsWithRecord = yearControls.reduce(
      (accumulator, control) => accumulator + getNumberOfInfractionsWithRecord(control),
      0
    )

    const numberOfInfractionsWithoutRecord = yearControls.reduce(
      (accumulator, control) => accumulator + getNumberOfInfractionsWithoutRecord(control),
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

    if (!numberOfInfractionsWithRecord && numberOfInfractionsWithoutRecord) {
      return (
        <>
          , {numberOfInfractionsWithoutRecord} {pluralize('infraction', numberOfInfractionsWithoutRecord)} sans PV{' '}
          <GlodenPuppy />
        </>
      )
    }

    if (numberOfInfractionsWithRecord && numberOfInfractionsWithoutRecord) {
      return (
        <>
          , {numberOfInfractions} {pluralize('infraction', numberOfInfractions)} dont {numberOfInfractionsWithoutRecord}{' '}
          sans PV <Red /> <GlodenPuppy />
        </>
      )
    }

    return (
      <>
        , {numberOfInfractions} {pluralize('infraction', numberOfInfractions)} <Red />
      </>
    )
  }, [yearControls, isEmpty])

  const sortedControls = useMemo(
    () =>
      yearControls.sort((a, b) =>
        a.actionDatetimeUtc && b.actionDatetimeUtc && a.actionDatetimeUtc > b.actionDatetimeUtc ? -1 : 1
      ),
    [yearControls]
  )

  return (
    yearControls && (
      <Row>
        <YearListTitle
          isEmpty={isEmpty}
          isOpen={isOpen}
          onClick={() => !isEmpty && setIsOpen(!isOpen)}
          title={year.toString()}
        >
          <YearListTitleText isEmpty={isEmpty}>
            {!isEmpty && <YearListChevronIcon $isOpen={isOpen} />}
            <Year>{year}</Year>
            <YearResume data-cy="vessel-controls-year">
              {!isEmpty ? (
                <>
                  {yearControls.length} {pluralize('contrôle', yearControls.length)}
                </>
              ) : (
                'Aucun contrôle'
              )}
              {numberOfInfractionsText}
            </YearResume>
          </YearListTitleText>
        </YearListTitle>

        {isOpen && (
          // TODO Why do we need to pass a name prop here?
          <YearListContent name={year.toString()}>
            {sortedControls.map(
              (control, index) =>
                control && <Control key={control.id} control={control} isLastItem={yearControls.length === index + 1} />
            )}
          </YearListContent>
        )}
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

const GlodenPuppy = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: ${p => p.theme.color.goldenPoppy};
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
