import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import SeaFrontControlObjectives from './SeaFrontControlObjectives'
import { useDispatch } from 'react-redux'
import getAllControlObjectives from '../../../domain/use_cases/controlObjective/getAllControlObjectives'
import getAllFleetSegments from '../../../domain/use_cases/fleetSegment/getAllFleetSegments'
import InputPicker from 'rsuite/lib/InputPicker'
import getControlObjectivesYearEntries from '../../../domain/use_cases/controlObjective/getControlObjectivesYearEntries'

const ControlObjectives = () => {
  const dispatch = useDispatch()
  const [controlObjectives, setControlObjectives] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [yearEntries, setYearEntries] = useState([{ label: `Année ${new Date().getFullYear()}`, value: new Date().getFullYear() }])

  useEffect(() => {
    dispatch(getAllFleetSegments())
    dispatch(getControlObjectivesYearEntries()).then(years => {
      if (years?.length) {
        const yearsWithLabel = years.map(year => ({ label: `Année ${year}`, value: year }))
        setYearEntries(yearsWithLabel)
      }
    })
  }, [])

  useEffect(() => {
    dispatch(getAllControlObjectives(year)).then(controlObjectives => {
      setControlObjectives(controlObjectives)
    })
  }, [year])

  return (
    <Wrapper>
      <Year>
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
      <ControlObjectivesContainer>
        <SeaFrontControlObjectives
          title={'NORD ATLANTIQUE - MANCHE OUEST (NAMO)'}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'NAMO')}
        />
        <SeaFrontControlObjectives
          title={'MANCHE EST – MER DU NORD (MEMN)'}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'MEMN')}
        />
        <SeaFrontControlObjectives
          title={'SUD-ATLANTIQUE (SA)'}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'SA')}
        />
        <SeaFrontControlObjectives
          title={'Méditerranée (MED)'}
          data={controlObjectives?.filter(controlObjective => controlObjective.facade === 'MED')}
        />
      </ControlObjectivesContainer>
    </Wrapper>
  )
}

const ControlObjectivesContainer = styled.div`
  width: 100%;
  height: calc(100vh - 90px);
  padding: 0px 20px 20px 20px;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
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
  
  .rs-picker-has-value .rs-btn .rs-picker-toggle-value, .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    font-size: 18px;
    color: ${COLORS.gunMetal};
    font-weight: 700;
    text-transform: uppercase;
    width: fit-content;
  }
  
  .rs-picker-default .rs-picker-toggle.rs-btn-xs .rs-picker-toggle-caret, .rs-picker-default .rs-picker-toggle.rs-btn-xs .rs-picker-toggle-clean {
    top: 6px;
  }
  
  .rs-picker-input .rs-picker-default .rs-picker-toggle-wrapper .rs-picker-placement-bottom-start .rs-picker-has-value .rs-picker-focused {
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
