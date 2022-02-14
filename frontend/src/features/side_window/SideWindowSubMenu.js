import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import SideWindowSubMenuLink from './SideWindowSubMenuLink'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../domain/entities/alerts'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { beaconStatusesStages, BeaconStatusesSubMenu } from './beacon_statuses/beaconStatuses'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedMenu
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param beaconStatuses
 * @param alerts
 * @return {JSX.Element}
 * @constructor
 */
const SideWindowSubMenu = ({ selectedMenu, selectedSubMenu, setSelectedSubMenu, beaconStatuses, alerts }) => {
  const [isOpen, setIsOpen] = useState(false)

  return <Menu
    style={menuStyle(isOpen)}
  >
    <Chevron
      style={chevronStyle(isOpen)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <ChevronIcon style={chevronIconStyle(isOpen)}/>
    </Chevron>
    <Title style={titleStyle(isOpen)}>
      Vue d&apos;ensemble
    </Title>
    {
      selectedMenu === sideWindowMenu.ALERTS.code &&
        <>
          <SideWindowSubMenuLink
            isOpen={isOpen}
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.MEMN.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.MEMN}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MEMN.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.NAMO.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.NAMO}
            isSelected={selectedSubMenu.code === AlertsSubMenu.NAMO.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.SA.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.SA}
            isSelected={selectedSubMenu.code === AlertsSubMenu.SA.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.MED.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.MED}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MED.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            oneLine
            number={alerts.filter(alert => AlertsMenuSeaFrontsToSeaFrontList.OUTREMEROA.seaFronts.includes(alert?.value?.seaFront)).length}
            menu={AlertsSubMenu.OUTREMEROA}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROA.code}
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
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
          isOpen={isOpen}
          number={beaconStatuses.filter(beaconStatus => beaconStatus.stage !== beaconStatusesStages.RESUMED_TRANSMISSION.code).length}
          menu={BeaconStatusesSubMenu.MALFUNCTIONING}
          isSelected={selectedSubMenu.code === BeaconStatusesSubMenu.MALFUNCTIONING.code}
          setSelected={setSelectedSubMenu}
        />
      </>
    }
  </Menu>
}

const Chevron = styled.div``
const chevronStyle = isOpen => ({
  width: 24,
  height: 24,
  cursor: 'pointer',
  position: 'absolute',
  marginLeft: isOpen ? 186 : 15,
  transition: 'all 0.5s',
  border: `1px solid ${COLORS.lightGray}`,
  background: COLORS.background,
  borderRadius: '50%'
})

const ChevronIcon = styled(ChevronIconSVG)``
const chevronIconStyle = isOpen => ({
  height: 8,
  marginLeft: 5,
  marginTop: 8,
  transform: isOpen ? 'rotate(270deg)' : 'rotate(90deg)',
  transition: 'all 0.5s'
})

const Menu = styled.div``
const menuStyle = (isOpen) => ({
  width: isOpen ? 200 : 30,
  height: '100vh',
  background: COLORS.gainsboro,
  flexShrink: 0,
  fontSize: 16,
  fontWeight: 500,
  color: COLORS.slateGray,
  padding: '14px 0',
  transition: 'all 0.5s'
})

const Title = styled.span``
const titleStyle = isOpen => ({
  width: 180,
  display: 'inline-block',
  paddingBottom: 11,
  paddingLeft: 20,
  borderBottom: `1px solid ${COLORS.lightGray}`,
  visibility: isOpen ? 'visible' : 'hidden'
})

export default SideWindowSubMenu
