import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const MapCoordinatesBox = props => {
  return (<Coordinates>{props.coordinates}</Coordinates>)
}

const Coordinates = styled.span`
  position: absolute;
  bottom: 10px;
  left: 40px;
  display: inline-block;
  margin: 1px;
  padding: 2px 0 6px 2px;
  color: ${COLORS.textWhite};
  font-size: 13px;
  font-weight: 300;
  text-decoration: none;
  text-align: center;
  height: 1.275em;
  background-color: ${COLORS.grayDarkerThree};
  border: none;
  border-radius: 2px;
  width: 195px;
`

export default MapCoordinatesBox
