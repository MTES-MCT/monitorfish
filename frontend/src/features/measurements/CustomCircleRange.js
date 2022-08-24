import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { coordinatesAreDistinct, getCoordinates } from '../../coordinates'
import { CoordinatesFormat, MeasurementTypes, OPENLAYERS_PROJECTION } from '../../domain/entities/map'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import SetCoordinates from '../coordinates/SetCoordinates'

function CustomCircleRange({ onAddCustomCircleRange, onCancelAddCircleRange }) {
  const { circleMeasurementInDrawing, measurementTypeToAdd } = useSelector(state => state.measurement)
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const [circleCoordinatesToAdd, setCircleCoordinatesToAdd] = useState([])
  const [circleRadiusToAdd, setCircleRadiusToAdd] = useState('')

  useEffect(() => {
    if (measurementTypeToAdd === MeasurementTypes.CIRCLE_RANGE) {
      if (circleMeasurementInDrawing?.coordinates?.length) {
        const ddCoordinates = getCoordinates(
          circleMeasurementInDrawing?.coordinates,
          OPENLAYERS_PROJECTION,
          CoordinatesFormat.DECIMAL_DEGREES,
          false,
        ).map(coordinate => parseFloat(coordinate.replace(/°/g, '')))
        setCircleCoordinatesToAdd(ddCoordinates)
      }

      if (circleMeasurementInDrawing?.measurement) {
        setCircleRadiusToAdd(circleMeasurementInDrawing?.measurement.replace('r = ', '').replace('nm', ''))
      }
    } else {
      setCircleCoordinatesToAdd([])
      setCircleRadiusToAdd('')
    }
  }, [circleMeasurementInDrawing, measurementTypeToAdd])

  /**
   * Compare with previous coordinates and update interest point coordinates
   * @param {number[]} nextCoordinates - Coordinates ([latitude, longitude]) to update, in decimal format.
   * @param {number[]} coordinates - Previous coordinates ([latitude, longitude]), in decimal format.
   */
  const updateCoordinates = (nextCoordinates, coordinates) => {
    if (nextCoordinates && nextCoordinates.length) {
      if (!coordinates?.length || coordinatesAreDistinct(nextCoordinates, coordinates)) {
        // Convert to [longitude, latitude] and OpenLayers projection
        // const updatedCoordinates = transform([nextCoordinates[1], nextCoordinates[0]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        setCircleCoordinatesToAdd(nextCoordinates)
      }
    }
  }

  const addCustomCircleRange = (circleCoordinatesToAdd, circleRadiusToAdd) => {
    onAddCustomCircleRange(circleCoordinatesToAdd, circleRadiusToAdd)
    setCircleCoordinatesToAdd([])
    setCircleRadiusToAdd('')
  }

  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      isOpen={measurementTypeToAdd === MeasurementTypes.CIRCLE_RANGE}
    >
      <Header>Définir une valeur</Header>
      <Body>
        <p>Coordonnées</p>
        <SetCoordinates coordinates={circleCoordinatesToAdd} updateCoordinates={updateCoordinates} />
        <p>Distance (rayon)</p>
        <input
          data-cy="measurement-circle-radius-input"
          onChange={e => setCircleRadiusToAdd(e.target.value)}
          style={{ width: 62 }}
          type="text"
          value={circleRadiusToAdd}
        />
        <span>(Nm)</span>
        <br />
        <OkButton
          data-cy="measurement-circle-add"
          onClick={() => addCustomCircleRange(circleCoordinatesToAdd, circleRadiusToAdd)}
        >
          OK
        </OkButton>
        <CancelButton onClick={() => onCancelAddCircleRange()}>Annuler</CancelButton>
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

  :hover,
  :focus {
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
  margin-right: ${props => (props.isOpen ? '45px' : '-320px')};
  opacity: ${props => (props.isOpen ? '1' : '0')};
  top: 249px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

export default CustomCircleRange
