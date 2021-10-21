import CoordinateInput from 'react-coordinate-input'
import React, { useEffect, useState } from 'react'
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

  const [update, setUpdate] = useState([])
  const [showedValue, setShowedValue] = useState(null)

  /** Convert the coordinates to the [latitude, longitude] string format */
  useEffect(() => {
    setShowedValue(getCoordinatesFromFormat(coordinates, coordinatesFormat))
  }, [coordinates, coordinatesFormat])

  useEffect(() => {
    console.log(update, coordinates)
    if (coordinatesAreModifiedAndNotRoundedByInput()) {
      updateCoordinates(update, coordinates)
    }
  }, [update, coordinates, updateCoordinates])

  function coordinatesAreModifiedAndNotRoundedByInput () {
    return coordinates?.length
      ? update?.length && coordinates?.length && (update[0] !== coordinates[0] || update[1] !== coordinates[1])
      : update?.length
  }

  return <Body>
    <CoordinateInput
      data-cy={'dms-coordinates-input'}
      onChange={(_, { dd }) => setUpdate(dd)}
      ddPrecision={5}
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
