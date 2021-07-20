import CoordinateInput from 'react-coordinate-input'
import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const DMSCoordinatesInput = props => {
  const {
    getCoordinatesFromFormat,
    coordinates,
    coordinatesFormat,
    updateCoordinates
  } = props

  return <Body>
    <CoordinateInput
      onChange={(_, { dd }) => updateCoordinates(dd, coordinates)}
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
  }
`

export default DMSCoordinatesInput
