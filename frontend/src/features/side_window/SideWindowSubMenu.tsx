import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../domain/entities/alerts'
import { beaconMalfunctionsStages } from '../../domain/entities/beaconMalfunction'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { AlertAndReportingTab } from './SideWindow'
import SideWindowSubMenuLink from './SideWindowSubMenuLink'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedMenu
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param selectedTab
 * @param fixed
 * @param setIsFixed
 * @return {JSX.Element}
 * @constructor
 */
function SideWindowSubMenu({ fixed, selectedMenu, selectedSubMenu, selectedTab, setIsFixed, setSelectedSubMenu }) {
  const [isOpen, setIsOpen] = useState(false)
  const alerts = useSelector(state => state.alert.alerts)
  const currentReportings = useSelector(state => state.reporting.currentReportings)
  const beaconMalfunctions = useSelector(state => state.beaconMalfunction.beaconMalfunctions)

  useEffect(() => {
    if (selectedMenu === sideWindowMenu.ALERTS.code) {
      setIsFixed(true)
      setIsOpen(true)
    } else if (selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code) {
      setIsFixed(false)
    }
  }, [selectedMenu])

  function getNumberOfAlertsOrReportingFromSeaFronts(seaFronts) {
    if (selectedTab === AlertAndReportingTab.ALERT) {
      return alerts.filter(alert => seaFronts.includes(alert?.value?.seaFront)).length
    }

    if (selectedTab === AlertAndReportingTab.REPORTING) {
      return currentReportings.filter(alert => seaFronts.includes(alert?.value?.seaFront)).length
    }
  }

  const numberOfBeaconMalfunctions = useMemo(
    () =>
      beaconMalfunctions.filter(
        beaconMalfunction =>
          beaconMalfunction.stage !== beaconMalfunctionsStages.END_OF_MALFUNCTION.code &&
          beaconMalfunction.stage !== beaconMalfunctionsStages.ARCHIVED.code
      ).length,
    [beaconMalfunctions]
  )

  return (
    <Menu
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => !fixed && setIsOpen(false)}
      style={menuStyle(isOpen, fixed)}
    >
      <Chevron data-cy="side-window-sub-menu-trigger" onClick={() => setIsFixed(!fixed)} style={chevronStyle(isOpen)}>
        <ChevronIcon style={chevronIconStyle(isOpen)} />
      </Chevron>
      <Title style={titleStyle(isOpen)}>Vue d&apos;ensemble</Title>
      {selectedMenu === sideWindowMenu.ALERTS.code && (
        <>
          <SideWindowSubMenuLink
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MEMN.code}
            menu={AlertsSubMenu.MEMN}
            number={getNumberOfAlertsOrReportingFromSeaFronts(AlertsMenuSeaFrontsToSeaFrontList.MEMN.seaFronts)}
            oneLine
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === AlertsSubMenu.NAMO.code}
            menu={AlertsSubMenu.NAMO}
            number={getNumberOfAlertsOrReportingFromSeaFronts(AlertsMenuSeaFrontsToSeaFrontList.NAMO.seaFronts)}
            oneLine
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === AlertsSubMenu.SA.code}
            menu={AlertsSubMenu.SA}
            number={getNumberOfAlertsOrReportingFromSeaFronts(AlertsMenuSeaFrontsToSeaFrontList.SA.seaFronts)}
            oneLine
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === AlertsSubMenu.MED.code}
            menu={AlertsSubMenu.MED}
            number={getNumberOfAlertsOrReportingFromSeaFronts(AlertsMenuSeaFrontsToSeaFrontList.MED.seaFronts)}
            oneLine
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROA.code}
            menu={AlertsSubMenu.OUTREMEROA}
            number={getNumberOfAlertsOrReportingFromSeaFronts(AlertsMenuSeaFrontsToSeaFrontList.OUTREMEROA.seaFronts)}
            oneLine
            setSelected={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === AlertsSubMenu.OUTREMEROI.code}
            menu={AlertsSubMenu.OUTREMEROI}
            number={getNumberOfAlertsOrReportingFromSeaFronts(AlertsMenuSeaFrontsToSeaFrontList.OUTREMEROI.seaFronts)}
            oneLine
            setSelected={setSelectedSubMenu}
          />
        </>
      )}
      {selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code && (
        <SideWindowSubMenuLink
          isOpen={isOpen}
          isSelected={selectedSubMenu.code === BeaconMalfunctionsSubMenu.MALFUNCTIONING.code}
          menu={BeaconMalfunctionsSubMenu.MALFUNCTIONING}
          number={numberOfBeaconMalfunctions}
          setSelected={setSelectedSubMenu}
        />
      )}
    </Menu>
  )
}

const Chevron = styled.div``
const chevronStyle = isOpen => ({
  background: COLORS.background,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: '50%',
  cursor: 'pointer',
  height: 24,
  marginLeft: isOpen ? 186 : 15,
  position: 'absolute',
  transition: 'all 0.5s',
  width: 24
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
  background: COLORS.gainsboro,
  borderRight: `1px solid ${COLORS.lightGray}`,
  boxShadow: isOpen && !fixed ? '#CCCFD6 10px 0px 10px -8px' : 'unset',
  color: COLORS.slateGray,
  flexShrink: 0,
  fontSize: 16,
  fontWeight: 500,
  height: 'calc(100vh - 28px)',
  marginLeft: fixed ? 0 : 66,
  padding: '14px 0',
  position: fixed ? 'unset' : 'absolute',
  transition: 'width 0.5s',
  width: isOpen ? 200 : 30,
  zIndex: 999
})

const Title = styled.span``
const titleStyle = isOpen => ({
  borderBottom: `1px solid ${COLORS.lightGray}`,
  display: 'inline-block',
  opacity: isOpen ? 1 : 0,
  overflow: 'hidden',
  paddingBottom: 11,
  paddingLeft: 20,
  textOverflow: 'clip',
  transition: 'width 0.8s ease',
  whiteSpace: 'nowrap',
  width: isOpen ? 180 : 0
})

export default SideWindowSubMenu
