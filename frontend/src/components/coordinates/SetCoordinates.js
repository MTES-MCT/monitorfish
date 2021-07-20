import React, { useState } from 'react'
import styled from 'styled-components'
import CoordinateInput, { dmsToDecimal } from 'react-coordinate-input'

import { COLORS } from '../../constants/constants'
import { useSelector } from 'react-redux'
import { CoordinatesFormat } from '../../domain/entities/map'
import IMaskInput from 'react-imask/esm/input'

const SetCoordinates = ({ coordinates, setCoordinates }) => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const [error, setError] = useState('')

  const getCoordinatesInput = coordinatesFormat => {
    switch (coordinatesFormat) {
      case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
        return <>
          <CoordinateInput
            onChange={(_, { dd }) => setCoordinates(dd)}
            value={coordinates && Array.isArray(coordinates) && coordinates.length
              ? coordinates.join(', ')
              : undefined}
          />
          <CoordinatesType>(DMS)</CoordinatesType>
        </>
      case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
        return <>
          <IMaskInput
            style={{ width: 190, border: error ? '1px solid red' : null }}
            lazy={false}
            mask={'00° 00.000′ a 000° 00.000′ a'}
            radix="."
            onComplete={(value, mask) => {
              setError('')
              const latitude = mask._unmaskedValue.substring(0, 8)
              const longitude = mask._unmaskedValue.substring(8, mask._unmaskedValue.length)

              const NS = latitude[latitude.length - 1]
              if (!['N', 'S'].includes(NS)) {
                setError('La latitude doit être N ou S')
                return
              }
              const latitudeDegrees = parseInt(latitude.substring(0, 2))
              if (latitudeDegrees < 0 || latitudeDegrees > 90) {
                setError('La latitude doit être comprise entre 0 et 90°')
                return
              }
              const latitudeMinutes = parseInt(latitude.substring(2, 4))
              const latitudeSeconds = parseInt(latitude.substring(4, 7)) * Math.pow(10, -3) * 60

              const EW = longitude[longitude.length - 1]
              if (!['E', 'W'].includes(EW)) {
                setError('La longitude doit être E ou W')
                return
              }
              const longitudeDegrees = parseInt(longitude.substring(0, 3))
              if (longitudeDegrees < 0 || longitudeDegrees > 180) {
                setError('La longitude doit être comprise entre 0 et 180°')
                return
              }
              const longitudeMinutes = parseInt(longitude.substring(3, 5))
              const longitudeSeconds = parseInt(longitude.substring(5, 8)) * Math.pow(10, -3) * 60

              const ddLatitude = dmsToDecimal(latitudeDegrees, latitudeMinutes, latitudeSeconds, NS, 4)
              const ddLongitude = dmsToDecimal(longitudeDegrees, longitudeMinutes, longitudeSeconds, EW, 4)

              if (!Number.isNaN(ddLatitude) && !Number.isNaN(ddLongitude)) {
                setCoordinates([ddLatitude, ddLongitude])
              } else {
                setError('Format lat/long invalide')
              }
            }}
            placeholder='__° __.___′ _ ___° __.___′'
          />
          <CoordinatesType>(DMD)</CoordinatesType>
          <Error>{error}</Error>
        </>
      case CoordinatesFormat.DECIMAL_DEGREES:
        return <>
          <DDInput placeholder={'Latitude'}/>
          <DDInput placeholder={'Longitude'}/>
          <CoordinatesType>(DD)</CoordinatesType>
          <Error>{error}</Error>
        </>
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

const DDInput = styled.input`
  width: 100px;
  margin-right: 5px !important;
`

const Error = styled.span`
  display: inline-block;
  color: red;
`

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

export default SetCoordinates
