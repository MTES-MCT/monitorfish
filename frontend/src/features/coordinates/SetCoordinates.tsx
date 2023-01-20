import { useCallback } from 'react'
import styled from 'styled-components'

import { CoordinatesFormat } from '../../domain/entities/map/constants'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { DDCoordinatesInput } from './DDCoordinatesInput'
import { DMDCoordinatesInput } from './DMDCoordinatesInput'
import { DMSCoordinatesInput } from './DMSCoordinatesInput'

type SetCoordinatesProps = {
  coordinates: number[]
  updateCoordinates: (nextCoordinates: number[], coordinates: number[]) => void
}
export function SetCoordinates({ coordinates, updateCoordinates }: SetCoordinatesProps) {
  const { coordinatesFormat } = useMainAppSelector(state => state.map)

  const getCoordinatesInput = useCallback(() => {
    switch (coordinatesFormat) {
      case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
        return (
          <DMSCoordinatesInput
            coordinates={coordinates}
            coordinatesFormat={CoordinatesFormat.DEGREES_MINUTES_SECONDS}
            updateCoordinates={updateCoordinates}
          />
        )
      case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
        return (
          <DMDCoordinatesInput
            coordinates={coordinates}
            coordinatesFormat={CoordinatesFormat.DEGREES_MINUTES_DECIMALS}
            updateCoordinates={updateCoordinates}
          />
        )
      case CoordinatesFormat.DECIMAL_DEGREES:
        return <DDCoordinatesInput coordinates={coordinates as any} updateCoordinates={updateCoordinates} />
      default:
        return null
    }
  }, [coordinates, updateCoordinates, coordinatesFormat])

  return <Body>{getCoordinatesInput()}</Body>
}

const Body = styled.div`
  color: ${p => p.theme.color.lightGray};
  font-size: 13px;
  text-align: left;

  input {
    background: ${p => p.theme.color.gainsboro};
    border: none;
    color: ${p => p.theme.color.gunMetal};
    height: 27px;
    margin-top: 7px;
    padding-left: 8px;
  }
`
