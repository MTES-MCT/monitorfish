import { Header, Zone } from '@features/Vessel/components/VesselSidebar/common_styles/common.style'
import { Accent, Button, customDayjs, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { YearReportings } from './YearReportings'

import type { VesselReportings } from '@features/Reporting/types'
import type { Promisable } from 'type-fest'

type ArchivedReportingListProps = Readonly<{
  fromDate: Date
  onMore: (() => Promisable<void>) | undefined
  vesselReportings: VesselReportings
}>
export function ArchivedReportingList({ fromDate, onMore, vesselReportings }: ArchivedReportingListProps) {
  const reportingsByYearAsPairs = useMemo(
    () => Object.entries(vesselReportings.archived).sort(([a], [b]) => Number(b) - Number(a)),
    [vesselReportings.archived]
  )

  return (
    <Zone data-cy="vessel-sidebar-archived-reporting">
      <Header>Historique des signalements</Header>
      {reportingsByYearAsPairs.length === 0 && (
        <NoReporting>{`Aucun signalement depuis ${customDayjs(fromDate).get('year')}`}</NoReporting>
      )}
      {reportingsByYearAsPairs.length > 0 && (
        <List>
          {reportingsByYearAsPairs.map(([year, reportingAndOccurences]) => (
            <YearReportings key={year} reportingAndOccurences={reportingAndOccurences} year={year} />
          ))}
        </List>
      )}
      <SeeMoreBackground>
        <Button accent={Accent.SECONDARY} onClick={onMore}>
          Afficher plus de signalements
        </Button>
      </SeeMoreBackground>
    </Zone>
  )
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoReporting = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  padding: 10px 0 10px 0;
  text-align: center;
  width: 100%;
`

const SeeMoreBackground = styled.div`
  background: ${THEME.color.white};
  margin: 0 5px 5px 5px;
  padding: 10px 0 5px 0;
  text-align: center;
  width: 100%;
`
