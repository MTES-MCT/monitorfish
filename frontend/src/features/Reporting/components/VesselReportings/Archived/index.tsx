import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { Header, Zone } from '@features/VesselSidebar/common_styles/common.style'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, THEME, Button } from '@mtes-mct/monitor-ui'
import dayjs from 'dayjs'
import styled from 'styled-components'

import { YearReportings } from './YearReportings'
import { setArchivedReportingsFromDate } from '../../../slice'

import type { ReportingAndOccurrences } from '@features/Reporting/types'

export function Archived() {
  const dispatch = useMainAppDispatch()
  const archivedReportingsFromDate = useMainAppSelector(state => state.reporting.archivedReportingsFromDate)
  const currentAndArchivedReportingsOfSelectedVessel = useMainAppSelector(
    state => state.reporting.currentAndArchivedReportingsOfSelectedVessel
  )

  const yearsToReportings = currentAndArchivedReportingsOfSelectedVessel?.archived

  const seeMore = () => {
    const nextDate = dayjs(archivedReportingsFromDate).subtract(1, 'year').toDate()

    dispatch(setArchivedReportingsFromDate(nextDate))
    dispatch(getVesselReportings(false))
  }

  return (
    <Zone data-cy="vessel-sidebar-reporting-tab-history">
      <Header>Historique des signalements</Header>
      {yearsToReportings && Object.keys(yearsToReportings)?.length ? (
        <List>
          {Object.keys(yearsToReportings)
            .sort((a, b) => Number(b) - Number(a))
            .map(
              year =>
                yearsToReportings[year] && (
                  <YearReportings
                    key={year}
                    year={Number(year)}
                    yearReportings={yearsToReportings[year] as ReportingAndOccurrences[]}
                  />
                )
            )}
        </List>
      ) : (
        <NoReporting>
          Aucun signalement{' '}
          {!!archivedReportingsFromDate && `depuis ${archivedReportingsFromDate.getUTCFullYear() + 1}`}
        </NoReporting>
      )}
      <SeeMoreBackground>
        <Button accent={Accent.SECONDARY} onClick={seeMore}>
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
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  width: 100%;
`

const SeeMoreBackground = styled.div`
  background: ${THEME.color.white};
  margin: 0px 5px 5px 5px;
  padding: 10px 0 5px 0;
  text-align: center;
  width: 100%;
`
