import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { useSelector } from 'react-redux'
import { CoordinatesFormat, WSG84_PROJECTION } from '../../domain/entities/map'
import { getCoordinates } from '../../utils'
import DMDCoordinatesInput from './DMDCoordinatesInput'
import DMSCoordinatesInput from './DMSCoordinatesInput'
import DDCoordinatesInput from './DDCoordinatesInput'

const SetCoordinates = ({ coordinates, updateCoordinates }) => {
  const { coordinatesFormat } = useSelector(state => state.map)

  const getCoordinatesFromFormat = (coordinates, coordinatesFormat) => {
    switch (coordinatesFormat) {
      case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
        return coordinates && Array.isArray(coordinates) && coordinates.length
          ? coordinates.join(', ')
          : undefined
      case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
        return coordinates && coordinates.length
          ? getCoordinates([coordinates[1], coordinates[0]], WSG84_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_DECIMALS)
            .map(coordinate => {
              return coordinate
                .replace(/[°′. ]/g, '')
            })
            .join('')
          : ''
      case CoordinatesFormat.DECIMAL_DEGREES:
        return coordinates
    }
  }

  const getCoordinatesInput = coordinatesFormat => {
    switch (coordinatesFormat) {
      case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
        return <DMSCoordinatesInput
          getCoordinatesFromFormat={getCoordinatesFromFormat}
          coordinates={coordinates}
          coordinatesFormat={coordinatesFormat}
          updateCoordinates={updateCoordinates}
        />
      case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
        return <DMDCoordinatesInput
          getCoordinatesFromFormat={getCoordinatesFromFormat}
          coordinates={coordinates}
          coordinatesFormat={coordinatesFormat}
          updateCoordinates={updateCoordinates}
        />
      case CoordinatesFormat.DECIMAL_DEGREES:
        return <DDCoordinatesInput
          getCoordinatesFromFormat={getCoordinatesFromFormat}
          coordinates={coordinates}
          coordinatesFormat={coordinatesFormat}
          updateCoordinates={updateCoordinates}
        />
    }
  }

  return (
    <Body>
      {
        getCoordinatesInput(coordinatesFormat)
      }
    </Body>
  )
}

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

export default SetCoordinates
