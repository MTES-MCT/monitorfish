import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import AlertsWindowSecondMenuLink from './AlertsWindowSecondMenuLink'
import { MenuSeaFronts } from './AlertsWindow'

const AlertsWindowSecondMenu = ({ selectedSeaFront, setSelectedSeaFront }) => {
  return <Menu>
    <Title>
      Vue d&apos;ensemble
    </Title>
    <AlertsWindowSecondMenuLink
      menu={MenuSeaFronts.MEMN}
      selectedSeaFront={selectedSeaFront}
      setSelectedSeaFront={setSelectedSeaFront}
    />
    <AlertsWindowSecondMenuLink
      menu={MenuSeaFronts.NAMOSA}
      selectedSeaFront={selectedSeaFront}
      setSelectedSeaFront={setSelectedSeaFront}
    />
    <AlertsWindowSecondMenuLink
      menu={MenuSeaFronts.MED}
      selectedSeaFront={selectedSeaFront}
      setSelectedSeaFront={setSelectedSeaFront}
    />
    <AlertsWindowSecondMenuLink
      menu={MenuSeaFronts.OUTREMEROA}
      selectedSeaFront={selectedSeaFront}
      setSelectedSeaFront={setSelectedSeaFront}
    />
    <AlertsWindowSecondMenuLink
      menu={MenuSeaFronts.OUTREMEROI}
      selectedSeaFront={selectedSeaFront}
      setSelectedSeaFront={setSelectedSeaFront}
    />
  </Menu>
}

const Menu = styled.div`
  width: 160px;
  height: 100vh;
  background: ${COLORS.gainsboro};
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.slateGray};
  padding: 25px 15px;
`

const Title = styled.span`
  width: 100%;
  display: inline-block;
  text-align: center;
  margin-bottom: 10px;
`

export default AlertsWindowSecondMenu
