import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import AlertsMenuLink from './AlertsMenuLink'
import { MenuSeaFronts } from '../../../domain/entities/alerts'

const AlertsMenu = ({ selectedMenuSeaFront, setSelectedMenuSeaFront }) => {
  return <Menu>
    <Title>
      Vue d&apos;ensemble
    </Title>
    <AlertsMenuLink
      menu={MenuSeaFronts.MEMN}
      selectedSeaFront={selectedMenuSeaFront}
      setSelectedSeaFront={setSelectedMenuSeaFront}
    />
    <AlertsMenuLink
      menu={MenuSeaFronts.NAMOSA}
      selectedSeaFront={selectedMenuSeaFront}
      setSelectedSeaFront={setSelectedMenuSeaFront}
    />
    <AlertsMenuLink
      menu={MenuSeaFronts.MED}
      selectedSeaFront={selectedMenuSeaFront}
      setSelectedSeaFront={setSelectedMenuSeaFront}
    />
    <AlertsMenuLink
      menu={MenuSeaFronts.OUTREMEROA}
      selectedSeaFront={selectedMenuSeaFront}
      setSelectedSeaFront={setSelectedMenuSeaFront}
    />
    <AlertsMenuLink
      menu={MenuSeaFronts.OUTREMEROI}
      selectedSeaFront={selectedMenuSeaFront}
      setSelectedSeaFront={setSelectedMenuSeaFront}
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

export default AlertsMenu
