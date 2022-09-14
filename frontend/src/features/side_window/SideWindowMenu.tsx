import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconMalfunctionsSVG } from '../icons/Icone_VMS.svg'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { useDispatch } from 'react-redux'

const SideWindowMenu = ({ selectedMenu }) => {
  const dispatch = useDispatch()

  return <Menu>
    <Link/>
    <Link
      title={sideWindowMenu.ALERTS.name}
      selected={selectedMenu === sideWindowMenu.ALERTS.code}
      onClick={() => dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))}
    >
      <AlertsIcon/>
    </Link>
    <Link
      data-cy={'side-window-menu-beacon-malfunctions'}
      title={sideWindowMenu.BEACON_MALFUNCTIONS.name}
      selected={selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code}
      onClick={() => dispatch(openSideWindowTab(sideWindowMenu.BEACON_MALFUNCTIONS.code))}
    >
      <BeaconMalfunctionsIcon/>
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
  padding: 0;
`

const Link = styled.div`
  text-align: center;
  background: ${props => props.selected ? COLORS.shadowBlue : 'none'};
  padding: 7px 5px;
  height: 50px;
  cursor: pointer;
  border-bottom: 0.5px solid ${COLORS.slateGray};
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 12px;
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 12px;
`

export default SideWindowMenu
