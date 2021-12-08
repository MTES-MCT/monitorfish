import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import SideWindowSubMenuLink from './SideWindowSubMenuLink'
import { AlertsSubMenu } from '../../domain/entities/alerts'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { BeaconStatusesSubMenu } from '../../domain/entities/beaconStatuses'

const SideWindowSubMenu = ({ selectedMenu, selectedSubMenu, setSelectedSubMenu }) => {
  return <Menu>
    <Title>
      Vue d&apos;ensemble
    </Title>
    {
      selectedMenu === sideWindowMenu.ALERTS &&
        <>
          <SideWindowSubMenuLink
            menu={AlertsSubMenu.MEMN}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MEMN.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            menu={AlertsSubMenu.NAMOSA}
            isSelected={selectedSubMenu.code === AlertsSubMenu.NAMOSA.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            menu={AlertsSubMenu.MED}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MED.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            menu={AlertsSubMenu.OUTREMEROA}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROA.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            menu={AlertsSubMenu.OUTREMEROI}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROI.code}
            setSelected={setSelectedSubMenu}
          />
        </>
    }
    {
      selectedMenu === sideWindowMenu.BEACON_STATUSES &&
      <>
        <SideWindowSubMenuLink
          menu={BeaconStatusesSubMenu.PAIRING}
          isSelected={selectedSubMenu.code === BeaconStatusesSubMenu.PAIRING.code}
          setSelected={setSelectedSubMenu}
        />
        <SideWindowSubMenuLink
          menu={BeaconStatusesSubMenu.MALFUNCTIONING}
          isSelected={selectedSubMenu.code === BeaconStatusesSubMenu.MALFUNCTIONING.code}
          setSelected={setSelectedSubMenu}
        />
        <SideWindowSubMenuLink
          menu={BeaconStatusesSubMenu.HISTORIC}
          isSelected={selectedSubMenu.code === BeaconStatusesSubMenu.HISTORIC.code}
          setSelected={setSelectedSubMenu}
        />
      </>
    }
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
  padding: 14px 0;
`

const Title = styled.span`
  width: 100%;
  display: inline-block;
  text-align: center;
  padding-bottom: 11px;
  border-bottom: 1px solid ${COLORS.lightGray};
`

export default SideWindowSubMenu
