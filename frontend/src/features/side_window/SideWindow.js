import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import SideWindowMenu from './SideWindowMenu'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { AlertsSubMenu } from '../../domain/entities/alerts'
import SideWindowSubMenu from './SideWindowSubMenu'
import BeaconStatuses from './beacon_statuses/BeaconStatuses'
import Alerts from './alerts/Alerts'
import { BeaconStatusesSubMenu } from '../../domain/entities/beaconStatuses'

const SideWindow = ({ menu }) => {
  const [selectedMenu, setSelectedMenu] = useState(sideWindowMenu.ALERTS)
  const [selectedSubMenu, setSelectedSubMenu] = useState(selectedMenu === sideWindowMenu.ALERTS
    ? AlertsSubMenu.MEMN
    : BeaconStatusesSubMenu.MALFUNCTIONING)

  useEffect(() => {
    if (menu) {
      setSelectedMenu(menu)
    }
  }, [menu, setSelectedMenu])

  return <Wrapper>
    <SideWindowMenu
      selectedMenu={selectedMenu}
      setSelectedMenu={setSelectedMenu}
    />
    <SideWindowSubMenu
      selectedMenu={selectedMenu}
      selectedSubMenu={selectedSubMenu}
      setSelectedSubMenu={setSelectedSubMenu}
    />
    {
      selectedMenu === sideWindowMenu.ALERTS &&
        <Alerts
          selectedSubMenu={selectedSubMenu}
          setSelectedSubMenu={setSelectedSubMenu}
        />
    }
    {
      selectedMenu === sideWindowMenu.BEACON_STATUSES &&
      <BeaconStatuses/>
    }
  </Wrapper>
}

const Wrapper = styled.div`
  display: flex;
`

export default SideWindow
