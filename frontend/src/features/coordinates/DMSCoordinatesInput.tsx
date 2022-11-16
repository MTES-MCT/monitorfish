import { useCallback, useMemo } from 'react'
import CoordinateInput from 'react-coordinate-input'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

import type { CoordinatesFormat } from '../../domain/entities/map'

type DMSCoordinatesInputProps = {
  coordinates: number[]
  coordinatesFormat: CoordinatesFormat
  updateCoordinates: (nextCoordinates: number[], coordinates: number[]) => void
}
export function DMSCoordinatesInput({ coordinates, coordinatesFormat, updateCoordinates }: DMSCoordinatesInputProps) {
  /** Convert the coordinates to the [latitude, longitude] string format */
  const showedValue = useMemo(() => {
    if (!coordinates?.length || !coordinatesFormat) {
      return ''
    }

    return coordinates?.join(', ') || ''
  }, [coordinates, coordinatesFormat])

  const update = useCallback(
    nextCoordinates => {
      updateCoordinates(nextCoordinates, coordinates)
    },
    [coordinates, updateCoordinates]
  )

  return (
    <Body>
      <CoordinateInput
        data-cy="dms-coordinates-input"
        ddPrecision={6}
        onChange={(_, { dd }) => update(dd)}
        value={showedValue}
      />
      <CoordinatesType>(DMS)</CoordinatesType>
    </Body>
  )
}

const CoordinatesType = styled.span`
  margin-left: 7px;
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
