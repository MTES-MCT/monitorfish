import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import SeaFrontControlObjectives from './SeaFrontControlObjectives'
import { useDispatch } from 'react-redux'
import getAllControlObjectives from '../../../domain/use_cases/getAllControlObjectives'
import getAllFleetSegments from '../../../domain/use_cases/getAllFleetSegments'

const ControlObjectives = () => {
  const dispatch = useDispatch()
  const [controlObjectives, setControlObjectives] = useState([])

  useEffect(() => {
    dispatch(getAllFleetSegments())
    dispatch(getAllControlObjectives()).then(controlObjectives => {
      setControlObjectives(controlObjectives)
    })
  }, [])

  console.log(controlObjectives)

  return (
    <ControlObjectivesContainer>
      <SeaFrontControlObjectives
        title={'NORD ATLANTIQUE - MANCHE OUEST (NAMO)'}
        data={controlObjectives.filter(controlObjective => controlObjective.facade === 'NAMO')}
      />
      <SeaFrontControlObjectives
        title={'MANCHE EST – MER DU NORD (MEMN)'}
        data={controlObjectives.filter(controlObjective => controlObjective.facade === 'MEMN')}
      />
      <SeaFrontControlObjectives
        title={'SUD-ATLANTIQUE (SA)'}
        data={controlObjectives.filter(controlObjective => controlObjective.facade === 'SA')}
      />
      <SeaFrontControlObjectives
        title={'Méditerranée (MED)'}
        data={controlObjectives.filter(controlObjective => controlObjective.facade === 'MED')}
      />
    </ControlObjectivesContainer>
  )
}

const ControlObjectivesContainer = styled.div`
  background-color: ${COLORS.white};
  width: 100%;
  height: calc(100vh - 160px);
  padding: 80px 20px;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

export default ControlObjectives
