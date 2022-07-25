import CoordinateInput from 'react-coordinate-input'
import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const DMSCoordinatesInput = props => {
  const {
    getCoordinatesFromFormat,
    /** @type {string} coordinates - In the [latitude, longitude] format */
    coordinates,
    coordinatesFormat,
    updateCoordinates
  } = props

  /** Convert the coordinates to the [latitude, longitude] string format */
  const showedValue = useMemo(() => {
    if (!coordinates?.length || !coordinatesFormat) {
      return ''
    }

    return getCoordinatesFromFormat(coordinates, coordinatesFormat)
  }, [coordinates, coordinatesFormat])

  const update = useCallback(nextCoordinates => {
    updateCoordinates(nextCoordinates, coordinates)
  }, [coordinates])

  return <Body>
    <CoordinateInput
      data-cy={'dms-coordinates-input'}
      onChange={(_, { dd }) => update(dd)}
      ddPrecision={6}
      value={showedValue}
    />
    <CoordinatesType>(DMS)</CoordinatesType>
  </Body>
}

const CoordinatesType = styled.span`
  margin-left: 7px;
`

const Body = styled.div`
  text-align: left;
  font-size: 13px;

  input {
    margin-top: 7px;
    background: ${COLORS.gainsboro};
    border: none;
    height: 27px;
    padding-left: 8px;
    width: 200px;
  }
`

export default DMSCoordinatesInput
