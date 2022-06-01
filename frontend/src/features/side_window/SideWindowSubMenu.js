import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import SideWindowSubMenuLink from './SideWindowSubMenuLink'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../domain/entities/alerts'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { beaconMalfunctionsStages } from '../../domain/entities/beaconMalfunction'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedMenu
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param beaconMalfunctions
 * @param alerts
 * @param fixed
 * @param setIsFixed
 * @return {JSX.Element}
 * @constructor
 */
const SideWindowSubMenu = ({ selectedMenu, selectedSubMenu, setSelectedSubMenu, beaconMalfunctions, alerts, fixed, setIsFixed }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (selectedMenu === sideWindowMenu.ALERTS.code) {
      setIsFixed(true)
      setIsOpen(true)
    } else if (selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code) {
      setIsFixed(false)
    }
  }, [selectedMenu])

  return <Menu
    style={menuStyle(isOpen, fixed)}
    onMouseEnter={() => setIsOpen(true)}
    onMouseLeave={() => !fixed && setIsOpen(false)}
  >
    <Chevron
      data-cy={'side-window-sub-menu-trigger'}
      style={chevronStyle(isOpen)}
      onClick={() => setIsFixed(!fixed)}
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
      selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code &&
      <>
        <SideWindowSubMenuLink
          isOpen={isOpen}
          number={beaconMalfunctions.filter(beaconMalfunction =>
            beaconMalfunction.stage !== beaconMalfunctionsStages.END_OF_MALFUNCTION.code &&
            beaconMalfunction.stage !== beaconMalfunctionsStages.ARCHIVED.code).length}
          menu={BeaconMalfunctionsSubMenu.MALFUNCTIONING}
          isSelected={selectedSubMenu.code === BeaconMalfunctionsSubMenu.MALFUNCTIONING.code}
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
const menuStyle = (isOpen, fixed) => ({
  width: isOpen ? 200 : 30,
  height: 'calc(100vh - 28px)',
  background: COLORS.gainsboro,
  flexShrink: 0,
  fontSize: 16,
  fontWeight: 500,
  color: COLORS.slateGray,
  padding: '14px 0',
  transition: 'width 0.5s',
  position: fixed ? 'unset' : 'absolute',
  marginLeft: fixed ? 0 : 66,
  boxShadow: isOpen && !fixed ? '#CCCFD6 10px 0px 10px -8px' : 'unset',
  zIndex: 999,
  borderRight: `1px solid ${COLORS.lightGray}`

})

const Title = styled.span``
const titleStyle = isOpen => ({
  display: 'inline-block',
  paddingBottom: 11,
  paddingLeft: 20,
  borderBottom: `1px solid ${COLORS.lightGray}`,
  opacity: isOpen ? 1 : 0,
  width: isOpen ? 180 : 0,
  transition: 'width 0.8s ease',
  overflow: 'hidden',
  textOverflow: 'clip',
  whiteSpace: 'nowrap'
})

export default SideWindowSubMenu
