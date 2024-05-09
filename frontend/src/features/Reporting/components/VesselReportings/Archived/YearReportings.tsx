import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import {
  YearListChevronIcon,
  YearListContent,
  YearListTitle,
  YearListTitleText
} from '@features/VesselSidebar/common_styles/YearList.style'
import { THEME } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ReportingCard } from '../ReportingCard'

import type { Reporting } from '../../../../../domain/types/reporting'

type YearReportingsProps = {
  year: number
  yearReportings: Reporting[]
}
export function YearReportings({ year, yearReportings }: YearReportingsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const numberOfInfractionsSuspicion = useMemo(() => {
    if (!yearReportings.length) {
      return 0
    }

    return yearReportings.reduce(
      (accumulator, reporting) => accumulator + (reportingIsAnInfractionSuspicion(reporting.type) ? 1 : 0),
      0
    )
  }, [yearReportings])
  const numberOfObservations = yearReportings.length - numberOfInfractionsSuspicion

  const sortedReportings = useMemo(
    () =>
      yearReportings.sort((a, b) => {
        if (!b.validationDate || !a.validationDate) {
          return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
        }

        return new Date(b.validationDate).getTime() - new Date(a.validationDate).getTime()
      }),
    [yearReportings]
  )

  return (
    <Row>
      <YearListTitle
        data-cy="vessel-sidebar-reporting-tab-archive-year"
        isEmpty={yearReportings.length === 0}
        isOpen={isOpen}
      >
        <YearListTitleText
          isEmpty={yearReportings.length === 0}
          onClick={() => yearReportings.length && setIsOpen(!isOpen)}
          title={year.toString()}
        >
          {!!yearReportings.length && <YearListChevronIcon $isOpen={isOpen} />}
          <Year>{year}</Year>
          <YearResume data-cy="vessel-reporting-year">
            {!yearReportings.length && 'Pas de signalement'}
            {!!numberOfInfractionsSuspicion && (
              <>
                {numberOfInfractionsSuspicion} suspicion{numberOfInfractionsSuspicion > 1 ? 's' : ''} d&apos;infraction
                {numberOfInfractionsSuspicion > 1 ? 's' : ''} <Red />
              </>
            )}
            {!!numberOfObservations && (
              <>
                {numberOfObservations} observation{numberOfObservations > 1 ? 's' : ''} <Opal />
              </>
            )}
          </YearResume>
        </YearListTitleText>
      </YearListTitle>
      {isOpen && (
        // TODO Why do we need to pass a name prop here?
        <YearListContentWithPadding name={year.toString()}>
          {sortedReportings.map(reporting => (
            <ReportingCard
              key={reporting.id}
              isArchive
              openConfirmDeletionModalForId={() => {}}
              reporting={reporting}
            />
          ))}
        </YearListContentWithPadding>
      )}
    </Row>
  )
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  margin-right: 10px;
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const Opal = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: ${THEME.color.opal};
  border-radius: 50%;
  display: inline-block;
`

const Year = styled.span`
  color: ${THEME.color.slateGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
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

const YearListContentWithPadding = styled(YearListContent)`
  padding: 16px 16px 0px 16px;
`
