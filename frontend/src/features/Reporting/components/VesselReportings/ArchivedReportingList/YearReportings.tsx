import { ReportingCard } from '@features/Reporting/components/ReportingCard'
import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import {
  YearListChevronIcon,
  YearListContent,
  YearListRow,
  YearListTitle,
  YearListTitleText
} from '@features/Vessel/components/VesselSidebar/components/common/YearList.style'
import { trackEvent } from '@hooks/useTracking'
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

  const handleOpen = (): void => {
    if (!reportingAndOccurences.length) {
      return
    }

    if (!isOpen) {
      trackEvent({
        action: `Affichage de l'année ${year}`,
        category: 'REPORTING',
        name: 'CNSP'
      })
    }

    setIsOpen(!isOpen)
  }

  return (
    <div>
      <YearListRow>
        <YearListTitle
          as={!reportingAndOccurences.length ? 'div' : 'button'}
          data-cy="vessel-sidebar-reporting-archive-year"
          onClick={handleOpen}
        >
          <YearListTitleText>
            <Year>{year}</Year>
            <YearResume data-cy="vessel-reporting-year">
              {!reportingAndOccurences.length && 'Pas de signalement'}
              {!!numberOfInfractionsSuspicion && (
                <>
                  {numberOfInfractionsSuspicion} suspicion{numberOfInfractionsSuspicion > 1 ? 's' : ''}{' '}
                  d&apos;infraction
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
        {!!reportingAndOccurences.length && <YearListChevronIcon isOpen={isOpen} onClick={handleOpen} />}
      </YearListRow>

      {isOpen && (
        <Row>
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
        </Row>
      )}
    </div>
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

const YearListContentWithPadding = styled(YearListContent)`
  padding: 16px 16px 0 16px;
`
