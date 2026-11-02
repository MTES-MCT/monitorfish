import { ReportingCard } from '@features/Reporting/components/ReportingCard'
import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { CollapsibleListItem } from '@features/Vessel/components/VesselSidebar/components/common/CollapsibleListItem'
import { trackEvent } from '@hooks/useTracking'
import { THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import type { ReportingAndOccurrences } from '@features/Reporting/types'

type YearReportingsProps = Readonly<{
  reportingAndOccurences: ReportingAndOccurrences[]
  year: string
}>

export function YearReportings({ reportingAndOccurences, year }: YearReportingsProps) {
  const numberOfReportings = useMemo(
    () =>
      reportingAndOccurences.reduce(
        (accumulator, reportingAndOccurrences) =>
          // We must also add the alert which is not "another" alert (`+ 1`)
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

  const trackYearOpening = () =>
    trackEvent({
      action: `Affichage de l'année ${year}`,
      category: 'REPORTING',
      name: 'CNSP'
    })

  return (
    <CollapsibleListItem
      isEmpty={!reportingAndOccurences.length}
      onOpen={trackYearOpening}
      title={
        <>
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
        </>
      }
      titleDataCy="vessel-sidebar-reporting-archive-year"
    >
      <Content>
        {reportingAndOccurences.map(({ otherOccurrencesOfSameAlert, reporting }) => (
          <ReportingCard
            key={reporting.id}
            isArchived
            otherOccurrencesOfSameAlert={otherOccurrencesOfSameAlert}
            reporting={reporting}
          />
        ))}
      </Content>
    </CollapsibleListItem>
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
`

const YearResume = styled.span`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
`

const Content = styled.div`
  padding: 16px 16px 0 16px;
`
