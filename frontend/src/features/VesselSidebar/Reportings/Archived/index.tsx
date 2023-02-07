import dayjs from 'dayjs'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { YearReportings } from './YearReportings'
import { COLORS } from '../../../../constants/constants'
import { getYearsToReportingList } from '../../../../domain/entities/reporting'
import { setArchivedReportingsFromDate } from '../../../../domain/shared_slices/Reporting'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { Header, Zone } from '../../common_styles/common.style'

export function Archived() {
  const dispatch = useMainAppDispatch()
  const { archivedReportingsFromDate, currentAndArchivedReportingsOfSelectedVessel } = useMainAppSelector(
    state => state.reporting
  )

  const yearsToReportings = useMemo(() => {
    if (!currentAndArchivedReportingsOfSelectedVessel?.archived) {
      return {}
    }

    return getYearsToReportingList(archivedReportingsFromDate, currentAndArchivedReportingsOfSelectedVessel.archived)
  }, [currentAndArchivedReportingsOfSelectedVessel, archivedReportingsFromDate])

  const seeMore = useCallback(() => {
    const nextDate = dayjs(archivedReportingsFromDate).subtract(1, 'year')

    dispatch(setArchivedReportingsFromDate(nextDate))
  }, [dispatch, archivedReportingsFromDate])

  return (
    <Zone data-cy="vessel-sidebar-reporting-tab-history">
      <Header>Historique des signalements</Header>
      {yearsToReportings && Object.keys(yearsToReportings)?.length ? (
        <List>
          {Object.keys(yearsToReportings)
            .sort((a, b) => Number(b) - Number(a))
            .map(year => (
              <YearReportings key={year} year={Number(year)} yearReportings={yearsToReportings[year]} />
            ))}
        </List>
      ) : (
        <NoReporting>
          Aucun signalement{' '}
          {!!archivedReportingsFromDate && `depuis ${archivedReportingsFromDate.getUTCFullYear() + 1}`}
        </NoReporting>
      )}
      <SeeMoreBackground>
        <SeeMore onClick={seeMore}>Afficher plus de signalements</SeeMore>
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
  color: ${COLORS.gunMetal};
  font-size: 13px;
  width: 100%;
`

const SeeMoreBackground = styled.div`
  background: ${COLORS.white};
  margin: 0px 5px 5px 5px;
  padding: 10px 0 5px 0;
  text-align: center;
  width: 100%;
`

const SeeMore = styled.div`
  border: 1px solid ${COLORS.charcoal};
  color: ${COLORS.gunMetal};
  padding: 5px 10px 5px 10px;
  width: max-content;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
  background: ${COLORS.white};
`
