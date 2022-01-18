import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import SideWindowSubMenuLink from './SideWindowSubMenuLink'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../domain/entities/alerts'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { beaconStatusesStages, BeaconStatusesSubMenu } from './beacon_statuses/beaconStatuses'

const SideWindowSubMenu = ({ selectedMenu, selectedSubMenu, setSelectedSubMenu, beaconStatuses, alerts }) => {
  return <Menu>
    <Title>
      Vue d&apos;ensemble
    </Title>
    {
      selectedMenu === sideWindowMenu.ALERTS.code &&
        <>
          <SideWindowSubMenuLink
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.MEMN.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.MEMN}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MEMN.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.NAMO.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.NAMO}
            isSelected={selectedSubMenu.code === AlertsSubMenu.NAMO.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.SA.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.SA}
            isSelected={selectedSubMenu.code === AlertsSubMenu.SA.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.MED.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.MED}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MED.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.OUTREMEROA.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.OUTREMEROA}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROA.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.OUTREMEROI.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.OUTREMEROI}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROI.code}
            setSelected={setSelectedSubMenu}
          />
        </>
    }
    {
      selectedMenu === sideWindowMenu.BEACON_STATUSES.code &&
      <>
        <SideWindowSubMenuLink
          number={beaconStatuses.filter(beaconStatus => beaconStatus.stage !== beaconStatusesStages.RESUMED_TRANSMISSION.code).length}
          menu={BeaconStatusesSubMenu.MALFUNCTIONING}
          isSelected={selectedSubMenu.code === BeaconStatusesSubMenu.MALFUNCTIONING.code}
          setSelected={setSelectedSubMenu}
        />
      </>
    }
  </Menu>
}

const Menu = styled.div`
  width: 200px;
  height: 100vh;
  background: ${COLORS.gainsboro};
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${COLORS.slateGray};
  padding: 14px 0;
`

const Title = styled.span`
  width: 180px;
  display: inline-block;
  padding-bottom: 11px;
  padding-left: 20px;
  border-bottom: 1px solid ${COLORS.lightGray};
`

export default SideWindowSubMenu
