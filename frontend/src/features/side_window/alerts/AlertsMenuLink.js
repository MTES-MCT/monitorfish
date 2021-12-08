import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const AlertsMenuLink = ({ menu, selectedSeaFront, setSelectedSeaFront }) => {
  return <Link
    selected={selectedSeaFront.code === menu.code}
    onClick={() => setSelectedSeaFront(menu)}
  >
    {
      selectedSeaFront.code === menu.code
        ? <Dot selected={selectedSeaFront.code === menu.code}/>
        : null
    }
    { menu.name }
  </Link>
}

const Dot = styled.div`
  height: 9px;
  width: 9px;
  background-color: ${COLORS.shadowBlue};
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 2px;
`

const Link = styled.div`
  color: ${props => props.selected ? COLORS.gunMetal : COLORS.slateGray};
  height: 26px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 700;
  margin-left: ${props => props.selected ? 0 : 17}px;
  cursor: pointer;
`

export default AlertsMenuLink
