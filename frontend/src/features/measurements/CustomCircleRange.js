import React from 'react'
import styled from 'styled-components'
import CoordinateInput from 'react-coordinate-input'

import { COLORS } from '../../constants/constants'
import { MeasurementTypes } from '../../domain/entities/map'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'

const CustomCircleRange = (
  {
    measurementTypeToAdd,
    setCircleCoordinatesToAdd,
    circleCoordinatesToAdd,
    circleRadiusToAdd,
    setCircleRadiusToAdd,
    cancelAddCircleRange,
    addCustomCircleRange,
    healthcheckTextWarning
  }) => {
  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      isOpen={measurementTypeToAdd === MeasurementTypes.CIRCLE_RANGE}>
      <Header>
        Définir une valeur
      </Header>
      <Body>
        <p>Coordonnées</p>
        <CoordinateInput
          onChange={(_, { dd }) => setCircleCoordinatesToAdd(dd)}
          value={circleCoordinatesToAdd && Array.isArray(circleCoordinatesToAdd) && circleCoordinatesToAdd.length
            ? circleCoordinatesToAdd.join(',')
            : undefined}
        />
        <span>(DMS)</span>
        <p>Distance (rayon)</p>
        <input
          type='text'
          onChange={e => setCircleRadiusToAdd(e.target.value)}
          value={circleRadiusToAdd}
        />
        <span>(Nm)</span><br/>
        <OkButton
          onClick={() => addCustomCircleRange()}
        >
          OK
        </OkButton>
        <CancelButton
          onClick={() => cancelAddCircleRange()}>
          Annuler
        </CancelButton>
      </Body>
    </Wrapper>
  )
}

const CancelButton = styled.button`
  border: 1px solid ${COLORS.charcoal};
  width: 130px;
  padding: 5px 12px;
  margin: 15px 0 0 15px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  
  :disabled {
    border: 1px solid ${COLORS.lightGray};
    color: ${COLORS.lightGray};
  }
`

const OkButton = styled.button`
  background: ${COLORS.charcoal};
  width: 130px;
  padding: 5px 12px;
  margin: 15px 0 0;
  font-size: 13px;
  color: ${COLORS.gainsboro};
  
  :hover, :focus {
    background: ${COLORS.charcoal};
  }
`

const Body = styled.div`
  margin: 10px 15px;
  text-align: left;
  font-size: 13px;
  color: ${COLORS.slateGray};
  
  p {
    margin: 0;
    font-size: 13px;
  }
  
  p:nth-of-type(2) {
    margin-top: 15px;
    font-size: 13px;
  }
  
  span {
    margin-left: 7px;
  }
  
  input {
    color: ${COLORS.charcoal};
    margin-top: 7px;
    background: ${COLORS.grayLighter};
    border: none;
    height: 27px;
    padding-left: 8px;
  }
  
  input:nth-of-type(2) {
    width: 32px;
  }
`

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const Wrapper = styled(MapComponentStyle)`
  width: 306px;
  background: ${COLORS.background};
  margin-right: ${props => !props.firstUpdate && props.isOpen ? '45px' : '-320px'};
  opacity:  ${props => !props.firstUpdate && props.isOpen ? '1' : '0'};
  top: 207px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

export default CustomCircleRange
