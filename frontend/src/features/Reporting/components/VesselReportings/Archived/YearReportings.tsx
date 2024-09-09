import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import {
  YearListChevronIcon,
  YearListContent,
  YearListTitle,
  YearListTitleText
} from '@features/Vessel/components/VesselSidebar/common_styles/YearList.style'
import { THEME } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ReportingCard } from '../ReportingCard'

import type { ReportingAndOccurrences } from '@features/Reporting/types'

type YearReportingsProps = {
  year: number
  yearReportings: ReportingAndOccurrences[]
}
export function YearReportings({ year, yearReportings }: YearReportingsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const numberOfReportings = useMemo(
    () =>
      yearReportings.reduce(
        (accumulator, reportingAndOccurrences) =>
          accumulator + reportingAndOccurrences.otherOccurrencesOfSameAlert.length + 1,
        0
      ),
    [yearReportings]
  )

  const numberOfInfractionsSuspicion = useMemo(() => {
    if (!yearReportings.length) {
      return 0
    }

    return yearReportings.reduce((accumulator, reportingAndOccurrences) => {
      const reportingCount = reportingIsAnInfractionSuspicion(reportingAndOccurrences.reporting.type) ? 1 : 0
      const otherOccurrencesCount = reportingAndOccurrences.otherOccurrencesOfSameAlert
        .map(reporting => (reportingIsAnInfractionSuspicion(reporting.type) ? Number(1) : Number(0)))
        .reduce((acc, val) => acc + val, 0)

      return accumulator + reportingCount + otherOccurrencesCount
    }, 0)
  }, [yearReportings])

  const numberOfObservations = numberOfReportings - numberOfInfractionsSuspicion

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
        <YearListContentWithPadding name={year.toString()}>
          {yearReportings.map(({ otherOccurrencesOfSameAlert, reporting }) => (
            <ReportingCard
              key={reporting.id}
              isArchived
              numberOfOccurrences={otherOccurrencesOfSameAlert.length + 1}
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
