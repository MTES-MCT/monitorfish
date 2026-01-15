import {
  ListItem,
  SidebarHeader,
  SidebarLoadMoreYears,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
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
    <SidebarZone data-cy="vessel-sidebar-archived-reporting">
      <SidebarHeader>Historique des signalements</SidebarHeader>
      {reportingsByYearAsPairs.length === 0 && (
        <NoReporting>{`Aucun signalement depuis ${customDayjs(fromDate).get('year')}`}</NoReporting>
      )}
      {reportingsByYearAsPairs.length > 0 && (
        <List>
          {reportingsByYearAsPairs.map(([year, reportingAndOccurences]) => (
            <ListItem key={year}>
              <YearReportings reportingAndOccurences={reportingAndOccurences} year={year} />
            </ListItem>
          ))}
        </List>
      )}
      <SidebarLoadMoreYears>
        <Button accent={Accent.SECONDARY} onClick={onMore}>
          Afficher plus de signalements
        </Button>
      </SidebarLoadMoreYears>
    </SidebarZone>
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
