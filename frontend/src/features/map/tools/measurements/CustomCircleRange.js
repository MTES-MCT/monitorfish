import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { CoordinatesFormat, MeasurementType, OPENLAYERS_PROJECTION } from '../../../../domain/entities/map'
import { useSelector } from 'react-redux'
import { coordinatesAreDistinct, getCoordinates } from '../../../../coordinates'
import SetCoordinates from '../../../coordinates/SetCoordinates'
import { MapToolBox } from '../MapToolBox'

const CustomCircleRange = ({ onCancelAddCircleRange, onAddCustomCircleRange }) => {
  const {
    measurementTypeToAdd,
    circleMeasurementInDrawing
  } = useSelector(state => state.measurement)
  const {
    healthcheckTextWarning
  } = useSelector(state => state.global)
  const [circleCoordinatesToAdd, setCircleCoordinatesToAdd] = useState([])
  const [circleRadiusToAdd, setCircleRadiusToAdd] = useState('')

  useEffect(() => {
    if (measurementTypeToAdd === MeasurementType.CIRCLE_RANGE) {
      if (circleMeasurementInDrawing?.coordinates?.length) {
        const ddCoordinates = getCoordinates(circleMeasurementInDrawing?.coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DECIMAL_DEGREES, false).map(coordinate => {
          return parseFloat(coordinate.replace(/°/g, ''))
        })
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
      isOpen={measurementTypeToAdd === MeasurementType.CIRCLE_RANGE}>
      <Header>
        Définir une valeur
      </Header>
      <Body>
        <p>Coordonnées</p>
        <SetCoordinates
          coordinates={circleCoordinatesToAdd}
          updateCoordinates={updateCoordinates}
        />
        <p>Distance (rayon)</p>
        <input
          style={{ width: 62 }}
          data-cy={'measurement-circle-radius-input'}
          type='text'
          onChange={e => setCircleRadiusToAdd(e.target.value)}
          value={circleRadiusToAdd}
        />
        <span>(Nm)</span><br/>
        <OkButton
          data-cy={'measurement-circle-add'}
          onClick={() => addCustomCircleRange(circleCoordinatesToAdd, circleRadiusToAdd)}
        >
          OK
        </OkButton>
        <CancelButton
          onClick={() => onCancelAddCircleRange()}>
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
    color: ${p => p.theme.color.gunMetal};
    margin-top: 7px;
    background: ${p => p.theme.color.gainsboro};
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

const Wrapper = styled(MapToolBox)`
  width: 306px;
  top: 249px;
`

export default CustomCircleRange
