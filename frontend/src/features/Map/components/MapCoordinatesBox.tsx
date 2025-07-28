import { useClickOutsideWhenOpened } from '@hooks/useClickOutsideWhenOpened'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { type Coordinates, MultiRadio } from '@mtes-mct/monitor-ui'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { getCoordinates } from '../../../coordinates'
import { COORDINATES_FORMAT_OPTIONS, CoordinatesFormat, OPENLAYERS_PROJECTION } from '../constants'
import { setCoordinatesFormat } from '../slice'

type MapCoordinatesBoxProps = {
  coordinates: Coordinates | undefined
}
export function MapCoordinatesBox({ coordinates }: MapCoordinatesBoxProps) {
  const wrapperRef = useRef(null)

  const dispatch = useMainAppDispatch()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const [isCoordinatesSelectionOpen, setIsCoordinatesSelectionOpen] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isCoordinatesSelectionOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setIsCoordinatesSelectionOpen(false)
    }
  }, [clickedOutsideComponent])

  return (
    <div ref={wrapperRef}>
      <CoordinatesTypeSelection $isOpen={isCoordinatesSelectionOpen}>
        <Header data-cy="coordinates-selection" onClick={() => setIsCoordinatesSelectionOpen(false)}>
          Unités des coordonnées
        </Header>
        <StyledMultiRadio
          isInline
          isLabelHidden
          label="Format de coordonnées"
          name="coordinatesRadio"
          onChange={nextValue => {
            dispatch(setCoordinatesFormat(nextValue as CoordinatesFormat))
          }}
          options={COORDINATES_FORMAT_OPTIONS}
          value={coordinatesFormat}
        />
      </CoordinatesTypeSelection>
      <CoordinatesButton onClick={() => setIsCoordinatesSelectionOpen(!isCoordinatesSelectionOpen)}>
        {getShowedCoordinates(coordinates, coordinatesFormat)} ({coordinatesFormat})
      </CoordinatesButton>
    </div>
  )
}

const getShowedCoordinates = (coordinates, coordinatesFormat) => {
  const transformedCoordinates = getCoordinates(coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)

  if (Array.isArray(transformedCoordinates) && transformedCoordinates.length === 2) {
    return `${transformedCoordinates[0]} ${transformedCoordinates[1]}`
  }

  return ''
}

const StyledMultiRadio = styled(MultiRadio)`
  padding: 12px 0 6px 22px;

  label {
    vertical-align: middle;
  }
`

const Header = styled.span`
  background-color: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 5px 0;
  width: 100%;
  display: inline-block;
  cursor: pointer;
  border: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const CoordinatesTypeSelection = styled.span<{
  $isOpen: boolean
}>`
  position: absolute;
  bottom: 40px;
  left: 40px;
  display: inline-block;
  margin: 1px;
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  font-weight: 300;
  text-decoration: none;
  text-align: center;
  background-color: ${p => p.theme.color.white};
  border: none;
  border-radius: 2px;
  width: 237px;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  height: ${props => (props.$isOpen ? 69 : 0)}px;
  transition: all 0.5s;
  overflow: hidden;
`

const CoordinatesButton = styled.span`
  position: absolute;
  bottom: 11px;
  left: 40px;
  display: inline-block;
  padding: 2px 0 6px 2px;
  color: ${p => p.theme.color.gainsboro};
  font-size: 13px;
  font-weight: 300;
  text-decoration: none;
  text-align: center;
  height: 17px;
  background-color: ${p => p.theme.color.charcoal};
  border: none;
  border-radius: 2px;
  width: 235px;
  cursor: pointer;
`
