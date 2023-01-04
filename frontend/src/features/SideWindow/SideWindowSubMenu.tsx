import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS, ALERTS_SUBMENU, SeaFront } from '../../domain/entities/alerts/constants'
import { STAGE_RECORD } from '../../domain/entities/beaconMalfunction/constants'
import { useAppSelector } from '../../hooks/useAppSelector'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { AlertAndReportingTab, SideWindowMenuKey } from './constants'
import { SideWindowSubMenuLink } from './SideWindowSubMenuLink'

import type { MenuItem } from '../../types'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

export type SideWindowSubMenuProps = {
  isFixed: boolean
  selectedMenu?: string
  selectedSubMenu: MenuItem<SeaFront | string>
  selectedTab: AlertAndReportingTab
  // TODO Rename that.
  setIsFixed: (isFixed: boolean) => Promisable<void>
  setSelectedSubMenu: (nexSubMenu: MenuItem<SeaFront | string>) => Promisable<void>
}

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function SideWindowSubMenu({
  isFixed,
  selectedMenu,
  selectedSubMenu,
  selectedTab,
  setIsFixed,
  setSelectedSubMenu
}: SideWindowSubMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pendingAlerts = useAppSelector(state => state.alert.pendingAlerts)
  const currentReportings = useAppSelector(state => state.reporting.currentReportings)
  const beaconMalfunctions = useAppSelector(state => state.beaconMalfunction.beaconMalfunctions)

  const numberOfBeaconMalfunctions = useMemo(
    () =>
      beaconMalfunctions.filter(
        beaconMalfunction =>
          beaconMalfunction.stage !== STAGE_RECORD.END_OF_MALFUNCTION.code &&
          beaconMalfunction.stage !== STAGE_RECORD.ARCHIVED.code
      ).length,
    [beaconMalfunctions]
  )

  const getNumberOfAlertsOrReportingFromSeaFronts = useCallback(
    (seaFronts: string[]): number => {
      if (selectedTab === AlertAndReportingTab.ALERT) {
        return pendingAlerts.filter(pendingAlert => seaFronts.includes(pendingAlert.value.seaFront)).length
      }

      if (selectedTab === AlertAndReportingTab.REPORTING) {
        return currentReportings.filter(reporting => seaFronts.includes(reporting.value.seaFront)).length
      }

      return 0
    },
    [currentReportings, pendingAlerts, selectedTab]
  )

  useEffect(() => {
    if (selectedMenu === SideWindowMenuKey.ALERTS) {
      setIsFixed(true)
      setIsOpen(true)
    } else if (selectedMenu === SideWindowMenuKey.BEACON_MALFUNCTIONS) {
      setIsFixed(false)
    }
  }, [selectedMenu, setIsFixed])

  return (
    <Menu
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => !isFixed && setIsOpen(false)}
      style={menuStyle(isOpen, isFixed)}
    >
      <Chevron data-cy="side-window-sub-menu-trigger" onClick={() => setIsFixed(!isFixed)} style={chevronStyle(isOpen)}>
        <ChevronIcon style={chevronIconStyle(isOpen)} />
      </Chevron>
      <Title style={titleStyle(isOpen)}>Vue d’ensemble</Title>
      {selectedMenu === SideWindowMenuKey.ALERTS && (
        <>
          <SideWindowSubMenuLink
            isOneLine
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === ALERTS_SUBMENU.MEMN.code}
            menu={ALERTS_SUBMENU.MEMN}
            number={getNumberOfAlertsOrReportingFromSeaFronts(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.MEMN.seaFronts)}
            setSelectedSubMenu={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOneLine
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === ALERTS_SUBMENU.NAMO.code}
            menu={ALERTS_SUBMENU.NAMO}
            number={getNumberOfAlertsOrReportingFromSeaFronts(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.NAMO.seaFronts)}
            setSelectedSubMenu={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOneLine
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === ALERTS_SUBMENU.SA.code}
            menu={ALERTS_SUBMENU.SA}
            number={getNumberOfAlertsOrReportingFromSeaFronts(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.SA.seaFronts)}
            setSelectedSubMenu={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOneLine
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === ALERTS_SUBMENU.MED.code}
            menu={ALERTS_SUBMENU.MED}
            number={getNumberOfAlertsOrReportingFromSeaFronts(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.MED.seaFronts)}
            setSelectedSubMenu={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOneLine
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === ALERTS_SUBMENU.OUTREMEROA.code}
            menu={ALERTS_SUBMENU.OUTREMEROA}
            number={getNumberOfAlertsOrReportingFromSeaFronts(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.OUTREMEROA.seaFronts)}
            setSelectedSubMenu={setSelectedSubMenu}
          />
          <SideWindowSubMenuLink
            isOneLine
            isOpen={isOpen}
            isSelected={selectedSubMenu.code === ALERTS_SUBMENU.OUTREMEROI.code}
            menu={ALERTS_SUBMENU.OUTREMEROI}
            number={getNumberOfAlertsOrReportingFromSeaFronts(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.OUTREMEROI.seaFronts)}
            setSelectedSubMenu={setSelectedSubMenu}
          />
        </>
      )}
      {selectedMenu === SideWindowMenuKey.BEACON_MALFUNCTIONS && (
        <SideWindowSubMenuLink
          isOpen={isOpen}
          isSelected={selectedSubMenu.code === BeaconMalfunctionsSubMenu.MALFUNCTIONING.code}
          menu={BeaconMalfunctionsSubMenu.MALFUNCTIONING as MenuItem<SeaFront>}
          number={numberOfBeaconMalfunctions}
          setSelectedSubMenu={setSelectedSubMenu}
        />
      )}
    </Menu>
  )
}

const Chevron = styled.div``
const chevronStyle = (isOpen: boolean): CSSProperties => ({
  background: COLORS.white,
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
const menuStyle = (isOpen: boolean, isFixed: boolean): CSSProperties => ({
  background: COLORS.gainsboro,
  borderRight: `1px solid ${COLORS.lightGray}`,
  boxShadow: isOpen && !isFixed ? '#CCCFD6 10px 0px 10px -8px' : 'unset',
  color: COLORS.slateGray,
  flexShrink: 0,
  fontSize: 16,
  fontWeight: 500,
  height: 'calc(100vh - 28px)',
  marginLeft: isFixed ? 0 : 70,
  padding: '14px 0',
  position: isFixed ? 'unset' : 'absolute',
  transition: 'width 0.5s',
  width: isOpen ? 200 : 30,
  zIndex: 999
})

const Title = styled.span``
const titleStyle = (isOpen: boolean): CSSProperties => ({
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
