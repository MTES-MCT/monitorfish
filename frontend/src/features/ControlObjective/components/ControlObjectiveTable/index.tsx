import { customDayjs } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { last } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InputPicker } from 'rsuite'
import styled from 'styled-components'

import { SeaFrontControlObjectives } from './SeaFrontControlObjectives'
import { COLORS } from '../../../../constants/constants'
import { SeaFront } from '../../../../domain/entities/seaFront/constants'
import { LoadingSpinnerWall } from '../../../../ui/LoadingSpinnerWall'
import {
  useAddControlObjectiveYearMutation,
  useGetControlObjectivesQuery,
  useGetControlObjectiveYearsQuery
} from '../../apis'

import type { Option } from '@mtes-mct/monitor-ui'

const NOW_YEAR = customDayjs.utc().year()
const LAST_YEAR_FROM_NOW = NOW_YEAR - 1
const NEXT_YEAR_FROM_NOW = NOW_YEAR + 1

export function ControlObjectiveTable() {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)

  const getControlObjectivesQuery = useGetControlObjectivesQuery(selectedYear || skipToken)
  const getControlObjectiveYearsQuery = useGetControlObjectiveYearsQuery()

  const [addControlObjectiveYear] = useAddControlObjectiveYearMutation()

  const nextYearToAddFromEntries = useMemo(
    () =>
      getControlObjectiveYearsQuery.data && getControlObjectiveYearsQuery.data.length > 0
        ? (last(getControlObjectiveYearsQuery.data) as number) + 1
        : undefined,
    [getControlObjectiveYearsQuery]
  )

  const hasLastYearInControlObjectiveYears = useMemo(
    () =>
      getControlObjectiveYearsQuery.data ? last(getControlObjectiveYearsQuery.data) === LAST_YEAR_FROM_NOW : false,
    [getControlObjectiveYearsQuery]
  )

  const yearsAsOptions: Array<Option<number>> = useMemo(
    () =>
      (getControlObjectiveYearsQuery.data || []).map(year => ({
        label: `Année ${year}`,
        value: year
      })),
    [getControlObjectiveYearsQuery]
  )

  const addYear = useCallback(async () => {
    if (!nextYearToAddFromEntries) {
      return
    }

    await addControlObjectiveYear()

    // Since there is no query param, we need to explicitely ask for a refetch
    getControlObjectiveYearsQuery.refetch()

    setSelectedYear(nextYearToAddFromEntries)
  }, [addControlObjectiveYear, getControlObjectiveYearsQuery, nextYearToAddFromEntries])

  useEffect(() => {
    if (!getControlObjectiveYearsQuery.data) {
      return
    }

    setSelectedYear(last(getControlObjectiveYearsQuery.data))
  }, [getControlObjectiveYearsQuery])

  if (!getControlObjectivesQuery.data || !getControlObjectiveYearsQuery.data || !selectedYear) {
    return <LoadingSpinnerWall />
  }

  return (
    <Wrapper>
      <Header>
        <Year data-cy="control-objectives-year">
          <InputPicker
            cleanable={false}
            creatable={false}
            data={yearsAsOptions}
            menuStyle={{ top: 46 }}
            onChange={setSelectedYear}
            size="xs"
            style={{ width: 0 }}
            value={selectedYear}
          />
        </Year>
        <AddYear
          data-cy="control-objectives-add-year"
          isVisible={hasLastYearInControlObjectiveYears || nextYearToAddFromEntries === NEXT_YEAR_FROM_NOW}
          onClick={addYear}
        >
          Ajouter l’année {nextYearToAddFromEntries || 'inconnue'}
        </AddYear>
      </Header>
      <ControlObjectivesContainer>
        <SeaFrontControlObjectives
          data={getControlObjectivesQuery.data.filter(controlObjective => controlObjective.facade === SeaFront.NAMO)}
          facade={SeaFront.NAMO}
          title="NORD ATLANTIQUE - MANCHE OUEST (NAMO)"
          year={selectedYear}
        />
        <SeaFrontControlObjectives
          data={getControlObjectivesQuery.data.filter(controlObjective => controlObjective.facade === SeaFront.MEMN)}
          facade={SeaFront.MEMN}
          title="MANCHE EST – MER DU NORD (MEMN)"
          year={selectedYear}
        />
        <SeaFrontControlObjectives
          data={getControlObjectivesQuery.data.filter(controlObjective => controlObjective.facade === SeaFront.SA)}
          facade={SeaFront.SA}
          title="SUD-ATLANTIQUE (SA)"
          year={selectedYear}
        />
        <SeaFrontControlObjectives
          data={getControlObjectivesQuery.data.filter(controlObjective => controlObjective.facade === SeaFront.MED)}
          facade={SeaFront.MED}
          title="Méditerranée (MED)"
          year={selectedYear}
        />
        <SeaFrontControlObjectives
          data={getControlObjectivesQuery.data.filter(controlObjective => controlObjective.facade === SeaFront.CORSE)}
          facade={SeaFront.CORSE}
          title="Corse (CORSE)"
          year={selectedYear}
        />
      </ControlObjectivesContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${COLORS.white};
  flex-grow: 1;
`

const Header = styled.div`
  display: flex;
`

const ControlObjectivesContainer = styled.div`
  width: 100%;
  height: calc(100vh - 90px);
  padding: 0px 20px 20px 20px;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const AddYear = styled.a<{
  isVisible: boolean
}>`
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')};
  height: fit-content;
  width: fit-content;
  margin-top: 23px;
  margin-right: 30px;
  margin-left: auto;
  text-decoration: underline;
  color: ${COLORS.gunMetal};
  cursor: pointer;
`

const Year = styled.div`
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
  padding-bottom: 5px;
  height: fit-content;
  width: 135px;
  margin: 20px 0 20px 60px;

  .rs-picker-input {
    border: none;
  }

  .rs-picker-default .rs-picker-toggle.rs-btn-xs {
    padding-left: 5px;
    width: 120px;
  }

  .rs-picker-has-value .rs-btn .rs-picker-toggle-value,
  .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    font-size: 18px;
    color: ${COLORS.gunMetal};
    font-weight: 700;
    text-transform: uppercase;
    width: fit-content;
  }

  .rs-picker-default .rs-picker-toggle.rs-btn-xs .rs-picker-toggle-caret,
  .rs-picker-default .rs-picker-toggle.rs-btn-xs .rs-picker-toggle-clean {
    top: 6px;
  }

  .rs-picker-input
    .rs-picker-default
    .rs-picker-toggle-wrapper
    .rs-picker-placement-bottom-start
    .rs-picker-has-value
    .rs-picker-focused {
    top: 46px;
  }

  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn-xs {
    padding-right: 17px;
  }

  .rs-input:focus {
    background: ${COLORS.charcoal};
    color: ${p => p.theme.color.white};
  }

  .rs-picker-search {
    visibility: hidden;
  }

  .rs-picker-select-menu-items {
    width: 100px !important;
  }
`
