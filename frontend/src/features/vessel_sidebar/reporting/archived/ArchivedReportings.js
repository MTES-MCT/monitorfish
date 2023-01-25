import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getYearsToReportingList } from '../../../../domain/entities/reporting'
import { Header, Zone } from '../../common_styles/common.style'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import YearReporting from './YearReporting'
import { setArchivedReportingsFromDate } from '../../../../domain/shared_slices/Reporting'

const ArchivedReportings = () => {
  const dispatch = useDispatch()
  const {
    /** @type {CurrentAndArchivedReportingsOfSelectedVessel} */
    currentAndArchivedReportingsOfSelectedVessel,
    archivedReportingsFromDate
  } = useSelector(state => state.reporting)

  /** @type {Object.<string, Reporting[]>} yearsToReportings */
  const yearsToReportings = useMemo(() => {
    let nextYearsToControls
    if (currentAndArchivedReportingsOfSelectedVessel?.archived) {
      nextYearsToControls = getYearsToReportingList(archivedReportingsFromDate, currentAndArchivedReportingsOfSelectedVessel.archived)
    }
    return nextYearsToControls
  }, [currentAndArchivedReportingsOfSelectedVessel, archivedReportingsFromDate])

  function seeMore () {
    const nextDate = new Date(archivedReportingsFromDate.getTime())
    nextDate.setMonth(nextDate.getMonth() - 12)

    dispatch(setArchivedReportingsFromDate(nextDate))
  }

  return <Zone data-cy={'vessel-sidebar-reporting-tab-history'}>
    <Header>Historique des signalements</Header>
    {
      yearsToReportings && Object.keys(yearsToReportings)?.length
        ? <List>
          {
            Object.keys(yearsToReportings)
              .sort((a, b) => b - a)
              .map((year, index) => {
                return <YearReporting
                  key={year + index}
                  year={year}
                  yearReportings={yearsToReportings[year]}
                  isLastItem={yearsToReportings[year].length === index + 1}
                />
              })
          }
        </List>
        : <NoReporting>
          Aucun signalement {archivedReportingsFromDate && `depuis ${archivedReportingsFromDate.getUTCFullYear() + 1}`}
        </NoReporting>
    }
    <SeeMoreBackground>
      <SeeMore onClick={seeMore}>
        Afficher plus de signalements
      </SeeMore>
    </SeeMoreBackground>
  </Zone>
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
  width: 100%
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

export default ArchivedReportings
