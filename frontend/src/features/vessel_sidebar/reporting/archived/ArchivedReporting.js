import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getYearsToReportingList } from '../../../../domain/entities/reporting'
import { Title, Zone } from '../../common_styles/common.style'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import YearReporting from './YearReporting'
import { setArchivedReportingFromDate } from '../../../../domain/shared_slices/Reporting'

const ArchivedReporting = () => {
  const dispatch = useDispatch()
  const {
    /** @type {Reporting} */
    currentAndArchivedReporting,
    /** @type {Reporting || null} */
    nextCurrentAndHistoryReporting,
    archivedReportingFromDate
  } = useSelector(state => state.reporting)

  /** @type {Object.<string, Reporting[]>} yearsToReporting */
  const yearsToReporting = useMemo(() => {
    let nextYearsToControls
    if (currentAndArchivedReporting.archived) {
      nextYearsToControls = getYearsToReportingList(archivedReportingFromDate, currentAndArchivedReporting.archived)
    }
    return nextYearsToControls
  }, [currentAndArchivedReporting, archivedReportingFromDate])

  function seeMore () {
    const nextDate = new Date(archivedReportingFromDate.getTime())
    nextDate.setMonth(nextDate.getMonth() - 12)

    dispatch(setArchivedReportingFromDate(nextDate))
  }

  console.log(currentAndArchivedReporting, nextCurrentAndHistoryReporting)

  return <Zone data-cy={'vessel-sidebar-reporting-tab-history'}>
    <Title>Historique des signalements</Title>
    {
      yearsToReporting && Object.keys(yearsToReporting)?.length
        ? <List>
          {
            Object.keys(yearsToReporting)
              .sort((a, b) => b - a)
              .map((year, index) => {
                return <YearReporting
                  key={year + index}
                  year={year}
                  yearReporting={yearsToReporting[year]}
                  isLastItem={yearsToReporting[year].length === index + 1}
                />
              })
          }
        </List>
        : <NoReporting>
          Aucun signalement {archivedReportingFromDate && `depuis ${archivedReportingFromDate.getUTCFullYear() + 1}`}
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
  background: ${COLORS.background};
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
  background: ${COLORS.background};
`

export default ArchivedReporting
