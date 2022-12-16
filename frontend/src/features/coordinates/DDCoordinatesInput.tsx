import { debounce } from 'lodash'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { isNumeric } from '../../utils/isNumeric'

type DDCoordinatesInputProps = {
  coordinates: [number, number]
  updateCoordinates: (nextCoordinates: [number, number], coordinates: [number, number]) => void
}
export function DDCoordinatesInput({ coordinates, updateCoordinates: onUpdateCoordinates }: DDCoordinatesInputProps) {
  const latitudeInputRef = useRef<HTMLInputElement>()
  const longitudeInputRef = useRef<HTMLInputElement>()

  const [latitudeError, setLatitudeError] = useState('')
  const [longitudeError, setLongitudeError] = useState('')

  const defaultValue = useMemo(() => {
    const [latitude, longitude] = coordinates

    if (isNumeric(latitude) && isNumeric(longitude)) {
      return {
        latitude: Number(latitude),
        longitude: Number(longitude)
      }
    }

    return {
      latitude: undefined,
      longitude: undefined
    }
  }, [coordinates])

  const handleChange = () => {
    if (!latitudeInputRef.current || !longitudeInputRef.current) {
      return
    }

    const latitudeAsString = latitudeInputRef.current.value
    const longitudeAsString = longitudeInputRef.current.value

    setLongitudeError('')
    setLatitudeError('')

    if (!isNumeric(latitudeAsString)) {
      setLatitudeError('Champ Latitude incorrect')

      return
    }

    if (!isNumeric(longitudeAsString)) {
      setLongitudeError('Champ Longitude incorrect')

      return
    }

    const latitude = Number(latitudeAsString)
    const longitude = Number(longitudeAsString)

    onUpdateCoordinates([latitude, longitude], coordinates)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandleChange = useCallback(debounce(handleChange, 500), [coordinates, onUpdateCoordinates])

  return (
    <Body>
      <DDInput
        ref={latitudeInputRef as any}
        data-cy="coordinates-dd-input-lat"
        defaultValue={defaultValue.latitude}
        onChange={debouncedHandleChange}
        placeholder="Latitude"
        style={{ border: latitudeError ? '1px solid red' : undefined }}
      />
      <DDInput
        ref={longitudeInputRef as any}
        data-cy="coordinates-dd-input-lon"
        defaultValue={defaultValue.longitude}
        onChange={debouncedHandleChange}
        placeholder="Longitude"
        style={{ border: longitudeError ? '1px solid red' : undefined }}
      />
      <CoordinatesType>(DD)</CoordinatesType>
      <Error>{latitudeError}</Error>
      <Error>{longitudeError}</Error>
    </Body>
  )
}

const DDInput = styled.input`
  margin-right: 5px !important;
  width: 100px;
`

const CoordinatesType = styled.span`
  margin-left: 7px;
`

const Error = styled.span`
  color: red;
  display: inline-block;
`

const Body = styled.div`
  font-size: 13px;
  text-align: left;

  input {
    background: ${COLORS.gainsboro};
    border: none;
    height: 27px;
    margin-top: 7px;
    padding-left: 8px;
  }
`
