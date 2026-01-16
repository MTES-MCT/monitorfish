import {
  YearListChevronIcon,
  YearListContent,
  YearListRow,
  YearListTitle,
  YearListTitleText
} from '@features/Vessel/components/VesselSidebar/components/common/YearList.style'
import { pluralize } from '@utils/pluralize'
import { useState } from 'react'
import styled from 'styled-components'

import { Control } from './Control'
import {
  getNumberOfInfractions,
  getNumberOfInfractionsWithoutRecord,
  getNumberOfInfractionsWithRecord
} from '../../../../../../domain/entities/controls'

import type { MissionAction } from '@features/Mission/missionAction.types'

type YearControlsProps = {
  year: number
  yearControls: MissionAction.MissionAction[]
}

export function YearControls({ year, yearControls }: YearControlsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isEmpty = yearControls.length === 0

  const numberOfInfractionsText = (function () {
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
  })()

  const sortedControls = yearControls.sort((a, b) =>
    a.actionDatetimeUtc && b.actionDatetimeUtc && a.actionDatetimeUtc > b.actionDatetimeUtc ? -1 : 1
  )

  return (
    yearControls && (
      <div>
        <YearListRow>
          <YearListTitle as={isEmpty ? 'div' : 'button'} onClick={() => !isEmpty && setIsOpen(!isOpen)}>
            <YearListTitleText>
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
          {!isEmpty && <YearListChevronIcon isOpen={isOpen} onClick={() => !isEmpty && setIsOpen(!isOpen)} />}
        </YearListRow>

        {isOpen && (
          <Row>
            <YearListContent>
              {sortedControls.map(control => control && <Control key={control.id} control={control} />)}
            </YearListContent>
          </Row>
        )}
      </div>
    )
  )
}

export const Row = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
`

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
  width: 39px;
  display: inline-block;
`

const YearResume = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-left: 15px;
`
