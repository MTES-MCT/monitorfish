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
import { Inquiry } from './Inquiry'
import {
  getInquiryDate,
  getInquiryNumberOfInfractionsWithoutRecord,
  getInquiryNumberOfInfractionsWithRecord,
  getNumberOfInfractions,
  getNumberOfInfractionsWithoutRecord,
  getNumberOfInfractionsWithRecord,
  isInquiryClosed
} from '../../../../../../domain/entities/controls'

import type { Inquiry as InquiryType } from '@features/Inquiry/Inquiry.types'
import type { MissionAction } from '@features/Mission/missionAction.types'

type YearControlsProps = {
  year: number
  yearControls: MissionAction.MissionAction[]
  yearInquiries: InquiryType.Inquiry[]
}

type YearItem =
  | { control: MissionAction.MissionAction; date: string | undefined; inquiry?: never }
  | { control?: never; date: string | undefined; inquiry: InquiryType.Inquiry }

export function YearControls({ year, yearControls, yearInquiries }: YearControlsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const closedInquiries = yearInquiries.filter(isInquiryClosed)
  const numberOfInProgressInquiries = yearInquiries.length - closedInquiries.length
  const numberOfControls = yearControls.length + closedInquiries.length
  const isEmpty = yearControls.length === 0 && yearInquiries.length === 0

  const numberOfInfractionsText = (function () {
    const numberOfInfractionsWithRecord =
      yearControls.reduce((accumulator, control) => accumulator + getNumberOfInfractionsWithRecord(control), 0) +
      closedInquiries.reduce(
        (accumulator, inquiry) => accumulator + getInquiryNumberOfInfractionsWithRecord(inquiry),
        0
      )

    const numberOfInfractionsWithoutRecord =
      yearControls.reduce((accumulator, control) => accumulator + getNumberOfInfractionsWithoutRecord(control), 0) +
      closedInquiries.reduce(
        (accumulator, inquiry) => accumulator + getInquiryNumberOfInfractionsWithoutRecord(inquiry),
        0
      )

    const numberOfInfractions =
      yearControls.reduce((accumulator, control) => accumulator + getNumberOfInfractions(control), 0) +
      closedInquiries.reduce((accumulator, inquiry) => accumulator + inquiry.infractions.length, 0)

    if (!numberOfControls) {
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
          <GoldenPuppy />
        </>
      )
    }

    if (numberOfInfractionsWithRecord && numberOfInfractionsWithoutRecord) {
      return (
        <>
          , {numberOfInfractions} {pluralize('infraction', numberOfInfractions)} dont {numberOfInfractionsWithoutRecord}{' '}
          sans PV <Red /> <GoldenPuppy />
        </>
      )
    }

    return (
      <>
        , {numberOfInfractions} {pluralize('infraction', numberOfInfractions)} <Red />
      </>
    )
  })()

  const numberOfControlsText = (function () {
    if (isEmpty) {
      return 'Aucun contrôle'
    }

    if (!numberOfControls) {
      return (
        <InProgress>
          {numberOfInProgressInquiries} {pluralize('contrôle', numberOfInProgressInquiries)}{' '}
          {pluralize('croisé', numberOfInProgressInquiries)} en cours
        </InProgress>
      )
    }

    return (
      <>
        {numberOfControls} {pluralize('contrôle', numberOfControls)}
        {closedInquiries.length === numberOfControls && <> {pluralize('croisé', numberOfControls)}</>}
        {closedInquiries.length > 0 && closedInquiries.length < numberOfControls && (
          <>
            {' '}
            dont {closedInquiries.length} {pluralize('croisé', closedInquiries.length)}
          </>
        )}
        {numberOfInProgressInquiries > 0 && (
          <InProgress>
            {' '}
            (+{numberOfInProgressInquiries} {pluralize('croisé', numberOfInProgressInquiries)} en cours)
          </InProgress>
        )}
      </>
    )
  })()

  const sortedItems: YearItem[] = [
    ...yearControls.map(control => ({ control, date: control.actionDatetimeUtc })),
    ...yearInquiries.map(inquiry => ({ date: getInquiryDate(inquiry), inquiry }))
  ].sort((a, b) => (a.date && b.date && a.date > b.date ? -1 : 1))

  return (
    <div>
      <YearListRow>
        <YearListTitle as={isEmpty ? 'div' : 'button'} onClick={() => !isEmpty && setIsOpen(!isOpen)}>
          <YearListTitleText>
            <Year>{year}</Year>
            <YearResume data-cy="vessel-controls-year">
              {numberOfControlsText}
              {numberOfInfractionsText}
            </YearResume>
          </YearListTitleText>
        </YearListTitle>
        {!isEmpty && <YearListChevronIcon isOpen={isOpen} onClick={() => !isEmpty && setIsOpen(!isOpen)} />}
      </YearListRow>

      {isOpen && (
        <Row>
          <YearListContent>
            {sortedItems.map(item =>
              item.control ? (
                <Control key={item.control.id} control={item.control} />
              ) : (
                <Inquiry key={item.inquiry.id} inquiry={item.inquiry} />
              )
            )}
          </YearListContent>
        </Row>
      )}
    </div>
  )
}

const InProgress = styled.span`
  font-style: italic;
`

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

const GoldenPuppy = styled.span`
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
  flex-shrink: 0;
`

const YearResume = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-left: 15px;
`
