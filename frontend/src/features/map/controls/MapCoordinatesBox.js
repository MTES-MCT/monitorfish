import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import { CoordinatesFormat, OPENLAYERS_PROJECTION } from '../../../domain/entities/map/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setCoordinatesFormat } from '../../../domain/shared_slices/Map'
import { getCoordinates } from '../../../coordinates'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'

const MapCoordinatesBox = ({ coordinates }) => {
  const wrapperRef = useRef(null)

  const dispatch = useDispatch()
  const { coordinatesFormat } = useSelector(state => state.map)
  const [coordinatesSelectionIsOpen, setCoordinatesSelectionIsOpen] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, coordinatesSelectionIsOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setCoordinatesSelectionIsOpen(false)
    }
  }, [clickedOutsideComponent])

  return (<div ref={wrapperRef}>
    <CoordinatesTypeSelection isOpen={coordinatesSelectionIsOpen}>
      <Header
        data-cy={'coordinates-selection'}
        onClick={() => setCoordinatesSelectionIsOpen(false)}
      >
        Unités des coordonnées
      </Header>
      <RadioWrapper
        inline
        name="coordinatesRadio"
        value={coordinatesFormat}
        onChange={value => dispatch(setCoordinatesFormat(value))}
      >
        <Radio
          inline
          value={CoordinatesFormat.DEGREES_MINUTES_SECONDS}
          title={'Degrés Minutes Secondes'}
        >
          DMS
        </Radio>
        <Radio
          data-cy={'coordinates-selection-dmd'}
          inline
          value={CoordinatesFormat.DEGREES_MINUTES_DECIMALS}
          title={'Degrés Minutes Décimales'}
        >
          DMD
        </Radio>
        <Radio
          data-cy={'coordinates-selection-dd'}
          inline
          value={CoordinatesFormat.DECIMAL_DEGREES}
          title={'Degrés Décimales'}
        >
          DD
        </Radio>
      </RadioWrapper>
    </CoordinatesTypeSelection>
    <Coordinates onClick={() => setCoordinatesSelectionIsOpen(!coordinatesSelectionIsOpen)}>
      {getShowedCoordinates(coordinates, coordinatesFormat)} ({coordinatesFormat})
    </Coordinates>
    </div>)
}

const getShowedCoordinates = (coordinates, coordinatesFormat) => {
  const transformedCoordinates = getCoordinates(coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)

  if (Array.isArray(transformedCoordinates) && transformedCoordinates.length === 2) {
    return `${transformedCoordinates[0]} ${transformedCoordinates[1]}`
  }

  return ''
}

const RadioWrapper = styled(RadioGroup)`
  padding: 6px 12px 12px 12px !important;
`

const Header = styled.span`
  background-color: ${COLORS.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 5px 0;
  width: 100%;
  display: inline-block;
  cursor: pointer;
  border: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const CoordinatesTypeSelection = styled.span`
  position: absolute;
  bottom: 40px;
  left: 40px;
  display: inline-block;
  margin: 1px;
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 300;
  text-decoration: none;
  text-align: center;
  background-color: ${COLORS.white};
  border: none;
  border-radius: 2px;
  width: 237px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  height: ${props => props.isOpen ? 69 : 0}px;
  transition: all 0.5s;
  overflow: hidden;
`

const Coordinates = styled.span`
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
  background-color: ${COLORS.charcoal};
  border: none;
  border-radius: 2px;
  width: 235px;
  cursor: pointer;
`

export default MapCoordinatesBox
