import { ReportingCard } from '@features/Reporting/components/ReportingCard'
import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import {
  YearListChevronIcon,
  YearListContent,
  YearListTitle,
  YearListTitleText
} from '@features/Vessel/components/VesselSidebar/components/common_styles/YearList.style'
import { THEME } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import type { ReportingAndOccurrences } from '@features/Reporting/types'

type YearReportingsProps = Readonly<{
  reportingAndOccurences: ReportingAndOccurrences[]
  year: string
}>
export function YearReportings({ reportingAndOccurences, year }: YearReportingsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const numberOfReportings = useMemo(
    () =>
      reportingAndOccurences.reduce(
        (accumulator, reportingAndOccurrences) =>
          // We must also add the useCases which is not "another" useCases (`+ 1`)
          accumulator + reportingAndOccurrences.otherOccurrencesOfSameAlert.length + 1,
        0
      ),
    [reportingAndOccurences]
  )

  const numberOfInfractionsSuspicion = useMemo(
    () =>
      reportingAndOccurences.reduce((accumulator, reportingAndOccurrences) => {
        const reportingCount = reportingIsAnInfractionSuspicion(reportingAndOccurrences.reporting.type) ? 1 : 0
        const otherOccurrencesCount = reportingAndOccurrences.otherOccurrencesOfSameAlert
          .map(reporting => (reportingIsAnInfractionSuspicion(reporting.type) ? Number(1) : Number(0)))
          .reduce((acc, val) => acc + val, 0)

        return accumulator + reportingCount + otherOccurrencesCount
      }, 0),
    [reportingAndOccurences]
  )

  const numberOfObservations = numberOfReportings - numberOfInfractionsSuspicion

  return (
    <Row>
      <YearListTitle
        $isEmpty={reportingAndOccurences.length === 0}
        $isOpen={isOpen}
        data-cy="vessel-sidebar-reporting-archive-year"
      >
        <YearListTitleText
          $isEmpty={reportingAndOccurences.length === 0}
          onClick={() => reportingAndOccurences.length && setIsOpen(!isOpen)}
          title={year.toString()}
        >
          {!!reportingAndOccurences.length && <YearListChevronIcon $isOpen={isOpen} />}
          <Year>{year}</Year>
          <YearResume data-cy="vessel-reporting-year">
            {!reportingAndOccurences.length && 'Pas de signalement'}
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
        <YearListContentWithPadding name={year.toString()}>
          {reportingAndOccurences.map(({ otherOccurrencesOfSameAlert, reporting }) => (
            <ReportingCard
              key={reporting.id}
              isArchived
              otherOccurrencesOfSameAlert={otherOccurrencesOfSameAlert}
              reporting={reporting}
            />
          ))}
        </YearListContentWithPadding>
      )}
    </Row>
  )
}

const Red = styled.span`
  background-color: ${p => p.theme.color.maximumRed};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-left: 5px;
  margin-right: 10px;
  width: 8px;
`

const Opal = styled.span`
  background-color: ${THEME.color.opal};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-left: 5px;
  width: 8px;
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
  background: ${p => p.theme.color.white};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  overflow: hidden !important;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`

const YearListContentWithPadding = styled(YearListContent)`
  padding: 16px 16px 0px 16px;
`
