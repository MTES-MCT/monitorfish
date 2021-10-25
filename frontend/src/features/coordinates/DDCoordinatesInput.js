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
    if (coordinates?.length) {
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

    if (latitude || longitude) {
      const floatLatitude = parseFloat(latitude)
      if (isNaN(floatLatitude) || !floatLatitude) {
        setLatitudeError('Champ Latitude incorrect')
        return
      }

      const floatLongitude = parseFloat(longitude)
      if (isNaN(floatLongitude) || !floatLongitude) {
        setLongitudeError('Champ Longitude incorrect')
        return
      }

      updateCoordinates([floatLatitude, floatLongitude], coordinates)
    }
  }, [latitude, longitude])

  return <Body>
    <DDInput
      data-cy={'coordinates-dd-input-lat'}
      style={{ border: latitudeError ? '1px solid red' : null }}
      value={latitude}
      onChange={e => setLatitude(e.target.value)}
      placeholder={'Latitude'}
    />
    <DDInput
      data-cy={'coordinates-dd-input-lon'}
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
  
  input {
    margin-top: 7px;
    background: ${COLORS.gainsboro};
    border: none;
    height: 27px;
    padding-left: 8px;
  }
`

export default DDCoordinatesInput
