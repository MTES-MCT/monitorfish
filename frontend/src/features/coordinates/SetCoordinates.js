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

  /**
   * Get coordinates for the input components in the specified format
   * @param {number[]} coordinates - Coordinates ([latitude, longitude]) in decimal format.
   * @param {string} coordinatesFormat - The wanted format of the returned coordinates (DMS, DMD or DD)
   * @returns {string | number[]} coordinates - The [latitude, longitude] coordinates as string for DMS and DMD and as array of number for DD.
   */
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

  const getCoordinatesInput = (coordinates, updateCoordinates, coordinatesFormat) => {
    switch (coordinatesFormat) {
      case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
        return <DMSCoordinatesInput
          getCoordinatesFromFormat={getCoordinatesFromFormat}
          coordinates={coordinates}
          coordinatesFormat={CoordinatesFormat.DEGREES_MINUTES_SECONDS}
          updateCoordinates={updateCoordinates}
        />
      case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
        return <DMDCoordinatesInput
          getCoordinatesFromFormat={getCoordinatesFromFormat}
          coordinates={coordinates}
          coordinatesFormat={CoordinatesFormat.DEGREES_MINUTES_DECIMALS}
          updateCoordinates={updateCoordinates}
        />
      case CoordinatesFormat.DECIMAL_DEGREES:
        return <DDCoordinatesInput
          getCoordinatesFromFormat={getCoordinatesFromFormat}
          coordinates={coordinates}
          coordinatesFormat={CoordinatesFormat.DECIMAL_DEGREES}
          updateCoordinates={updateCoordinates}
        />
    }
  }

  return (
    <Body>
      {
        getCoordinatesInput(coordinates, updateCoordinates, coordinatesFormat)
      }
    </Body>
  )
}

const Body = styled.div`
  text-align: left;
  font-size: 13px;
  color: ${COLORS.lightGray};
  
  input {
    margin-top: 7px;
    color: ${COLORS.gunMetal};
    background: ${COLORS.grayLighter};
    border: none;
    height: 27px;
    padding-left: 8px;
  }
`

export default SetCoordinates
