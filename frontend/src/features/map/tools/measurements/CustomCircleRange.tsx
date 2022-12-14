import { transform } from 'ol/proj'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { coordinatesAreDistinct, getCoordinates } from '../../../../coordinates'
import {
  CoordinatesFormat,
  MeasurementType,
  OPENLAYERS_PROJECTION,
  WSG84_PROJECTION
} from '../../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import {
  resetCircleMeasurementInDrawing,
  setCircleMeasurementInDrawing,
  setCircleMeasurementToAdd,
  setMeasurementTypeToAdd
} from '../../../../domain/shared_slices/Measurement'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { SetCoordinates } from '../../../coordinates/SetCoordinates'
import { MapToolBox } from '../MapToolBox'

export function CustomCircleRange() {
  const dispatch = useAppDispatch()
  const { circleMeasurementInDrawing, measurementTypeToAdd } = useAppSelector(state => state.measurement)
  const { healthcheckTextWarning } = useAppSelector(state => state.global)

  const circleCoordinates = useMemo(() => {
    if (measurementTypeToAdd !== MeasurementType.CIRCLE_RANGE || !circleMeasurementInDrawing?.coordinates?.length) {
      return []
    }

    return getCoordinates(
      circleMeasurementInDrawing?.coordinates,
      OPENLAYERS_PROJECTION,
      CoordinatesFormat.DECIMAL_DEGREES,
      false
    ).map(coordinate => parseFloat(coordinate.replace(/°/g, '')))
  }, [measurementTypeToAdd, circleMeasurementInDrawing])

  const circleRadius = useMemo(() => {
    if (measurementTypeToAdd !== MeasurementType.CIRCLE_RANGE || !circleMeasurementInDrawing?.measurement) {
      return ''
    }

    return circleMeasurementInDrawing?.measurement.replace('r = ', '').replace('nm', '')
  }, [measurementTypeToAdd, circleMeasurementInDrawing])

  /**
   * Compare with previous coordinates and update interest point coordinates
   * @param {number[]} nextCoordinates - Coordinates ([latitude, longitude]) to update, in decimal format.
   * @param {number[]} coordinates - Previous coordinates ([latitude, longitude]), in decimal format.
   */
  const updateCoordinates = (nextCoordinates, coordinates) => {
    if (!nextCoordinates?.length) {
      return
    }

    if (!coordinates?.length || coordinatesAreDistinct(nextCoordinates, coordinates)) {
      updateCustomCircleRange(nextCoordinates, circleRadius)
    }
  }

  const updateCustomCircleRange = useCallback(
    (nextCoordinates, nextCircleRadius) => {
      // Convert to [longitude, latitude] and OpenLayers projection
      const updatedCoordinates = transform(
        [nextCoordinates[1], nextCoordinates[0]],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )

      dispatch(
        setCircleMeasurementInDrawing({
          coordinates: updatedCoordinates,
          measurement: nextCircleRadius
        })
      )
    },
    [dispatch]
  )

  const addCustomCircleRange = useCallback(
    (nextCoordinates, nextCircleRadius) => {
      dispatch(
        setCircleMeasurementToAdd({
          circleCoordinatesToAdd: nextCoordinates,
          circleRadiusToAdd: nextCircleRadius
        })
      )
    },
    [dispatch]
  )

  const cancelAddCircleRange = useCallback(() => {
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(resetCircleMeasurementInDrawing())
    dispatch(setMapToolOpened(undefined))
  }, [dispatch])

  return (
    <Wrapper
      healthcheckTextWarning={!!healthcheckTextWarning}
      isOpen={measurementTypeToAdd === MeasurementType.CIRCLE_RANGE}
    >
      <Header>Définir une valeur</Header>
      <Body>
        <p>Coordonnées</p>
        <SetCoordinates coordinates={circleCoordinates} updateCoordinates={updateCoordinates} />
        <p>Distance (rayon)</p>
        <input
          data-cy="measurement-circle-radius-input"
          onChange={e => updateCustomCircleRange(circleCoordinates, e.target.value)}
          style={{ width: 62 }}
          type="text"
          value={circleRadius}
        />
        <span>(Nm)</span>
        <br />
        <OkButton
          data-cy="measurement-circle-add"
          onClick={() => addCustomCircleRange(circleCoordinates, circleRadius)}
        >
          OK
        </OkButton>
        <CancelButton onClick={cancelAddCircleRange}>Annuler</CancelButton>
      </Body>
    </Wrapper>
  )
}

const CancelButton = styled.button`
  border: 1px solid ${COLORS.charcoal};
  color: ${COLORS.gunMetal};
  font-size: 13px;
  margin: 15px 0 0 15px;
  padding: 5px 12px;
  width: 130px;

  :disabled {
    border: 1px solid ${COLORS.lightGray};
    color: ${COLORS.lightGray};
  }
`

const OkButton = styled.button`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  font-size: 13px;
  margin: 15px 0 0;
  padding: 5px 12px;
  width: 130px;

  :hover,
  :focus {
    background: ${COLORS.charcoal};
  }
`

const Body = styled.div`
  color: ${COLORS.slateGray};
  font-size: 13px;
  margin: 10px 15px;
  text-align: left;

  p {
    font-size: 13px;
    margin: 0;
  }

  p:nth-of-type(2) {
    font-size: 13px;
    margin-top: 15px;
  }

  span {
    margin-left: 7px;
  }

  input {
    background: ${p => p.theme.color.gainsboro};
    border: none;
    color: ${p => p.theme.color.gunMetal};
    height: 27px;
    margin-top: 7px;
    padding-left: 8px;
  }
`

const Header = styled.div`
  background: ${COLORS.charcoal};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${COLORS.gainsboro};
  font-size: 16px;
  padding: 9px 0 7px 15px;
  text-align: left;
`

const Wrapper = styled(MapToolBox)`
  top: 249px;
  width: 306px;
`
