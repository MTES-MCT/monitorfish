import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { isNumeric } from '../../utils/isNumeric'

type DDCoordinatesInputProps = {
  coordinates: number[]
  updateCoordinates: (nextCoordinates: number[], coordinates: number[]) => void
}
export function DDCoordinatesInput({ coordinates, updateCoordinates }: DDCoordinatesInputProps) {
  const [latitudeError, setLatitudeError] = useState('')
  const [longitudeError, setLongitudeError] = useState('')
  const [latitude, setLatitude] = useState<number | string>()
  const [longitude, setLongitude] = useState<number | string>()

  useEffect(
    () => () => {
      setLatitude('')
      setLongitude('')
      setLongitudeError('')
      setLatitudeError('')
    },
    []
  )

  useEffect(() => {
    const [nextLatitude, nextLongitude] = coordinates

    if (isNumeric(nextLatitude) && isNumeric(nextLongitude)) {
      setLatitude(nextLatitude)
      setLongitude(nextLongitude)
    }
  }, [coordinates])

  useEffect(() => {
    setLongitudeError('')
    setLatitudeError('')

    if (latitude || longitude) {
      if (!isNumeric(latitude)) {
        setLatitudeError('Champ Latitude incorrect')

        return
      }

      if (!isNumeric(longitude)) {
        setLongitudeError('Champ Longitude incorrect')

        return
      }

      updateCoordinates([latitude as number, longitude as number], coordinates)
    }
  }, [latitude, longitude, updateCoordinates, coordinates])

  return (
    <Body>
      <DDInput
        data-cy="coordinates-dd-input-lat"
        onChange={e => setLatitude(e.target.value)}
        placeholder="Latitude"
        style={{ border: latitudeError ? '1px solid red' : undefined }}
        value={latitude}
      />
      <DDInput
        data-cy="coordinates-dd-input-lon"
        onChange={e => setLongitude(e.target.value)}
        placeholder="Longitude"
        style={{ border: longitudeError ? '1px solid red' : undefined }}
        value={longitude}
      />
      <CoordinatesType>(DD)</CoordinatesType>
      <Error>{latitudeError}</Error>
      <Error>{longitudeError}</Error>
    </Body>
  )
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
