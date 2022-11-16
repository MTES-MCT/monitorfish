import { useCallback } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { CoordinatesFormat } from '../../domain/entities/map'
import { useAppSelector } from '../../hooks/useAppSelector'
import { DDCoordinatesInput } from './DDCoordinatesInput'
import { DMDCoordinatesInput } from './DMDCoordinatesInput'
import { DMSCoordinatesInput } from './DMSCoordinatesInput'

type SetCoordinatesProps = {
  coordinates: number[]
  updateCoordinates: (nextCoordinates: number[], coordinates: number[]) => void
}
export function SetCoordinates({ coordinates, updateCoordinates }: SetCoordinatesProps) {
  const { coordinatesFormat } = useAppSelector(state => state.map)

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
        return <DDCoordinatesInput coordinates={coordinates} updateCoordinates={updateCoordinates} />
      default:
        return null
    }
  }, [coordinates, updateCoordinates, coordinatesFormat])

  return <Body>{getCoordinatesInput()}</Body>
}

const Body = styled.div`
  text-align: left;
  font-size: 13px;
  color: ${COLORS.lightGray};

  input {
    margin-top: 7px;
    color: ${COLORS.gunMetal};
    background: ${p => p.theme.color.gainsboro};
    border: none;
    height: 27px;
    padding-left: 8px;
  }
`
