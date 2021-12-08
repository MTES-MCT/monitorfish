import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'

const SideWindowMenu = () => {
  return <Menu>
    <Link selected>
      <AlertsIcon/>
    </Link>
  </Menu>
}

const Menu = styled.div`
  width: 66px;
  height: 100vh;
  background: ${COLORS.charcoal};
  flex-shrink: 0;
  font-size: 11px;
  color: ${COLORS.gainsboro};
  padding: 15px 0;
`

const Link = styled.div`
  text-align: center;
  background: ${props => props.selected ? COLORS.shadowBlue : 'none'};
  padding: 0 5px;
  height: 45px;
  margin-top: 10px;
  cursor: pointer;
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 10px;
`

export default SideWindowMenu
