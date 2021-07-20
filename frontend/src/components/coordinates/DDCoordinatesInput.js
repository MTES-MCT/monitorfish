import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const DDCoordinatesInput = props => {
  const {
    coordinates,
    updateCoordinates
  } = props

  const [latitudeError, setLatitudeError] = useState('')
  const [longitudeError, setLongitudeError] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  useEffect(() => {
    if (coordinates && coordinates.length) {
      setLatitude(coordinates[0])
      setLongitude(coordinates[1])
    } else {
      setLatitude('')
      setLongitude('')
    }
  }, [coordinates])

  useEffect(() => {
    setLongitudeError(null)
    setLatitudeError(null)

    const floatLatitude = parseFloat(latitude)
    if (isNaN(floatLatitude)) {
      setLatitudeError('Champ Latitude incorrect')
      return
    }

    const floatLongitude = parseFloat(longitude)
    if (isNaN(floatLongitude)) {
      setLongitudeError('Champ Latitude incorrect')
      return
    }

    updateCoordinates([floatLatitude, floatLongitude], coordinates)
  }, [latitude, longitude])

  return <Body>
    <DDInput
      style={{ border: latitudeError ? '1px solid red' : null }}
      value={latitude}
      onChange={e => setLatitude(e.target.value)}
      placeholder={'Latitude'}
    />
    <DDInput
      style={{ border: longitudeError ? '1px solid red' : null }}
      value={longitude}
      onChange={e => setLongitude(e.target.value)}
      placeholder={'Longitude'}
    />
    <CoordinatesType>(DD)</CoordinatesType>
    <Error>{latitudeError}</Error>
    <Error>{longitudeError}</Error>
  </Body>
}

const DDInput = styled.input`
  width: 100px;
  margin-right: 5px !important;
`

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

export default DDCoordinatesInput
