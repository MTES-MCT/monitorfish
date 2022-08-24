import React, { useEffect, useState } from 'react'
import { dmsToDecimal } from 'react-coordinate-input'
import IMaskInput from 'react-imask/esm/input'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

function DMDCoordinatesInput(props) {
  const { coordinates, coordinatesFormat, getCoordinatesFromFormat, updateCoordinates } = props

  const [error, setError] = useState('')
  const [value, setValue] = useState('')

  useEffect(() => {
    if (coordinates?.length && coordinatesFormat) {
      setValue(getCoordinatesFromFormat(coordinates, coordinatesFormat))
    } else {
      setValue('')
    }
  }, [coordinates])

  function completeCoordinates(mask) {
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
    const latitudeSeconds = parseInt(latitude.substring(4, 7))

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
    const longitudeSeconds = parseInt(longitude.substring(5, 8))

    const dLatitude = dmsToDecimal(latitudeDegrees, latitudeMinutes + 10 ** -3 * latitudeSeconds, 0, NS, 6)
    const dLongitude = dmsToDecimal(longitudeDegrees, longitudeMinutes + 10 ** -3 * longitudeSeconds, 0, EW, 6)

    if (!Number.isNaN(dLatitude) && !Number.isNaN(dLongitude)) {
      updateCoordinates([dLatitude, dLongitude], coordinates)
    } else {
      setError('Format lat/long invalide')
    }
  }

  return (
    <Body>
      <IMaskInput
        data-cy="dmd-coordinates-input"
        lazy={false}
        mask="00° 00.000′ a 000° 00.000′ a"
        onAccept={(value, mask) => setValue(mask._value)}
        onComplete={(value, mask) => completeCoordinates(mask)}
        placeholder="__° __.___′ _ ___° __.___′"
        radix="."
        style={{ border: error ? '1px solid red' : null }}
        value={value}
      />
      <CoordinatesType>(DMD)</CoordinatesType>
      <Error>{error}</Error>
    </Body>
  )
}

const CoordinatesType = styled.span`
  margin-left: 7px;
`

const Error = styled.span`
  display: inline-block;
  color: red;
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

export default DMDCoordinatesInput
