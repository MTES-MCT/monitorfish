import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import SeaFrontControlObjectives from './SeaFrontControlObjectives'
import { useDispatch } from 'react-redux'
import getAllControlObjectives from '../../../domain/use_cases/controlObjective/getAllControlObjectives'
import { getAllFleetSegments } from '../../../domain/use_cases/fleetSegment/getAllFleetSegments'
import { InputPicker } from 'rsuite'
import getControlObjectivesYearEntries from '../../../domain/use_cases/controlObjective/getControlObjectivesYearEntries'
import addControlObjectiveYear from '../../../domain/use_cases/controlObjective/addControlObjectiveYear'

const currentYear = new Date().getFullYear()
const nextYear = currentYear + 1
const lastYear = currentYear - 1
const LAST_ITEM = -1

const ControlObjectives = () => {
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
        <Year data-cy={'control-objectives-year'}>
          <InputPicker
            value={year}
            onChange={_year => setYear(_year)}
            data={yearEntries}
            style={{ width: 0 }}
            menuStyle={{ top: 46 }}
            creatable={false}
            cleanable={false}
            size={'xs'}
          />
        </Year>
        <AddYear
          data-cy={'control-objectives-add-year'}
          isVisible={lastYearFoundInYearEntries || nextYearToAddFromEntries === nextYear}
          onClick={() => dispatch(addControlObjectiveYear()).then(() => setYear(nextYearToAddFromEntries))}
        >
          Ajouter l&apos;année {nextYearToAddFromEntries}
        </AddYear>
      </Header>
      <ControlObjectivesContainer>
        <SeaFrontControlObjectives
          title={'NORD ATLANTIQUE - MANCHE OUEST (NAMO)'}
          facade={'NAMO'}
          year={year}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'NAMO')}
        />
        <SeaFrontControlObjectives
          title={'MANCHE EST – MER DU NORD (MEMN)'}
          facade={'MEMN'}
          year={year}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'MEMN')}
        />
        <SeaFrontControlObjectives
          title={'SUD-ATLANTIQUE (SA)'}
          facade={'SA'}
          year={year}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'SA')}
        />
        <SeaFrontControlObjectives
          title={'Méditerranée (MED)'}
          facade={'MED'}
          year={year}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'MED')}
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
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
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
    color: ${p => p.theme.color.white};
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
