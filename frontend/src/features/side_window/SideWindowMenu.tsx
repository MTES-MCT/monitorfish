import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconMalfunctionsSVG } from '../icons/Icone_VMS.svg'

function SideWindowMenu({ selectedMenu }) {
  const dispatch = useDispatch()

  return (
    <Menu>
      <Link />
      <Link
        onClick={() => dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))}
        selected={selectedMenu === sideWindowMenu.ALERTS.code}
        title={sideWindowMenu.ALERTS.name}
      >
        <AlertsIcon />
      </Link>
      <Link
        data-cy="side-window-menu-beacon-malfunctions"
        onClick={() => dispatch(openSideWindowTab(sideWindowMenu.BEACON_MALFUNCTIONS.code))}
        selected={selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code}
        title={sideWindowMenu.BEACON_MALFUNCTIONS.name}
      >
        <BeaconMalfunctionsIcon />
      </Link>
    </Menu>
  )
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
  background: ${props => (props.selected ? COLORS.shadowBlue : 'none')};
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
