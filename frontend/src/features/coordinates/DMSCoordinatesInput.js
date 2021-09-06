import CoordinateInput from 'react-coordinate-input'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const DMSCoordinatesInput = props => {
  const {
    getCoordinatesFromFormat,
    coordinates,
    coordinatesFormat,
    updateCoordinates
  } = props

  const [update, setUpdate] = useState([])

  useEffect(() => {
    if (coordinatesAreModifiedAndNotRoundedByInput()) {
      updateCoordinates(update, coordinates)
    }
  }, [update, coordinates, updateCoordinates])

  function coordinatesAreModifiedAndNotRoundedByInput () {
    return update?.length && coordinates?.length &&
      (
        update[0].toFixed(3) !== coordinates[0].toFixed(3) ||
        update[1].toFixed(3) !== coordinates[1].toFixed(3)
      )
  }

  return <Body>
    <CoordinateInput
      onChange={(_, { dd }) => setUpdate(dd)}
      ddPrecision={4}
      value={getCoordinatesFromFormat(coordinates, coordinatesFormat)}
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
  color: ${COLORS.textGray};
  
  input {
    margin-top: 7px;
    color: ${COLORS.grayDarkerThree};
    background: ${COLORS.grayLighter};
    border: none;
    height: 27px;
    padding-left: 8px;
    width: 200px;
  }
`

export default DMSCoordinatesInput
