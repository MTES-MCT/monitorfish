import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconStatusesSVG } from '../icons/Icone_VMS.svg'
import { sideWindowMenu } from '../../domain/entities/sideWindow'

const SideWindowMenu = ({ selectedMenu, setSelectedMenu }) => {
  return <Menu>
    <Link
      title={sideWindowMenu.ALERTS.name}
      selected={selectedMenu === sideWindowMenu.ALERTS}
      onClick={() => setSelectedMenu(sideWindowMenu.ALERTS)}
    >
      <AlertsIcon/>
    </Link>
    <Link
      title={sideWindowMenu.BEACON_STATUSES.name}
      selected={selectedMenu === sideWindowMenu.BEACON_STATUSES}
      onClick={() => setSelectedMenu(sideWindowMenu.BEACON_STATUSES)}
    >
      <BeaconStatusesIcon/>
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
  padding: 50px 0;
`

const Link = styled.div`
  text-align: center;
  background: ${props => props.selected ? COLORS.shadowBlue : 'none'};
  padding: 0 5px;
  height: 50px;
  cursor: pointer;
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 12px;
`

const BeaconStatusesIcon = styled(BeaconStatusesSVG)`
  margin-top: 12px;
`

export default SideWindowMenu
