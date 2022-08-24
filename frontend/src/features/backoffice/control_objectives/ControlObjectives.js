import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { InputPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import addControlObjectiveYear from '../../../domain/use_cases/controlObjective/addControlObjectiveYear'
import getAllControlObjectives from '../../../domain/use_cases/controlObjective/getAllControlObjectives'
import getControlObjectivesYearEntries from '../../../domain/use_cases/controlObjective/getControlObjectivesYearEntries'
import getAllFleetSegments from '../../../domain/use_cases/fleetSegment/getAllFleetSegments'
import SeaFrontControlObjectives from './SeaFrontControlObjectives'

const currentYear = new Date().getFullYear()
const nextYear = currentYear + 1
const lastYear = currentYear - 1
const LAST_ITEM = -1

function ControlObjectives() {
  const dispatch = useDispatch()
  const [controlObjectives, setControlObjectives] = useState([])
  const [year, setYear] = useState(currentYear)
  const [yearEntries, setYearEntries] = useState([{ label: `Année ${currentYear}`, value: currentYear }])
  const nextYearToAddFromEntries =
    yearEntries
      ?.map(year => year.value)
      .sort()
      .at(LAST_ITEM) + 1
  const lastYearFoundInYearEntries =
    yearEntries
      ?.map(year => year.value)
      .sort()
      .at(LAST_ITEM) === lastYear

  useEffect(() => {
    dispatch(getAllFleetSegments())
  }, [])

  useEffect(() => {
    if (!yearEntries?.map(_year => year.value).includes(year)) {
      setYearEntries(yearEntries.concat([{ label: `Année ${year}`, value: year }]))
    }
    dispatch(getControlObjectivesYearEntries()).then(years => {
      if (years?.length) {
        if (!years.includes(currentYear)) {
          setYear(years.at(LAST_ITEM))

          return
        }
        const yearsWithLabel = years.map(year => ({ label: `Année ${year}`, value: year }))
        setYearEntries(yearsWithLabel)

        dispatch(getAllControlObjectives(year)).then(controlObjectives => {
          setControlObjectives(controlObjectives)
        })
      }
    })
  }, [year])

  return (
    <Wrapper>
      <Header>
        <Year data-cy="control-objectives-year">
          <InputPicker
            cleanable={false}
            creatable={false}
            data={yearEntries}
            menuStyle={{ top: 46 }}
            onChange={_year => setYear(_year)}
            size="xs"
            style={{ width: 0 }}
            value={year}
          />
        </Year>
        <AddYear
          data-cy="control-objectives-add-year"
          isVisible={lastYearFoundInYearEntries || nextYearToAddFromEntries === nextYear}
          onClick={() => dispatch(addControlObjectiveYear()).then(() => setYear(nextYearToAddFromEntries))}
        >
          Ajouter l&apos;année {nextYearToAddFromEntries}
        </AddYear>
      </Header>
      <ControlObjectivesContainer>
        <SeaFrontControlObjectives
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'NAMO')}
          facade="NAMO"
          title="NORD ATLANTIQUE - MANCHE OUEST (NAMO)"
          year={year}
        />
        <SeaFrontControlObjectives
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'MEMN')}
          facade="MEMN"
          title="MANCHE EST – MER DU NORD (MEMN)"
          year={year}
        />
        <SeaFrontControlObjectives
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'SA')}
          facade="SA"
          title="SUD-ATLANTIQUE (SA)"
          year={year}
        />
        <SeaFrontControlObjectives
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'MED')}
          facade="MED"
          title="Méditerranée (MED)"
          year={year}
        />
      </ControlObjectivesContainer>
    </Wrapper>
  )
}

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

const AddYear = styled.a`
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
  border-bottom: 2px solid ${COLORS.squareBorder};
  padding-bottom: 5px;
  height: fit-content;
  width: 135px;
  margin: 20px 0 20px 60px;

  .rs-picker-input {
    border: none;
    margin-left: -140px;
    margin-top: -3px;
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
    color: ${COLORS.background};
  }

  .rs-picker-search {
    visibility: hidden;
  }

  .rs-picker-select-menu-items {
    width: 100px !important;
  }
`

const Wrapper = styled.div`
  background-color: ${COLORS.white};
`

export default ControlObjectives
