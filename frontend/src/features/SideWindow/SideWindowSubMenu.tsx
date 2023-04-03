import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { AlertAndReportingTab, SideWindowMenuKey } from './constants'
import { SideWindowSubMenuLink } from './SideWindowSubMenuLink'
import { useGetMissionsQuery } from '../../api/mission'
import { COLORS } from '../../constants/constants'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS, ALERTS_SUBMENU } from '../../domain/entities/alerts/constants'
import { STAGE_RECORD } from '../../domain/entities/beaconMalfunction/constants'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

import type { SeaFront } from '../../constants'
import type { MenuItem } from '../../types'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

export type SideWindowSubMenuProps = {
  isFixed: boolean
  selectedMenu: string | undefined
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
  const pendingAlerts = useMainAppSelector(state => state.alert.pendingAlerts)
  const currentReportings = useMainAppSelector(state => state.reporting.currentReportings)
  const beaconMalfunctions = useMainAppSelector(state => state.beaconMalfunction.beaconMalfunctions)
  const getMissionsApiQuery = useGetMissionsQuery()

  const missions = useMemo(() => getMissionsApiQuery.data || [], [getMissionsApiQuery.data])

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

  const getMissionCountFromSeaFrontGroup = useCallback(
    (seaFronts: string[]): number =>
      missions.filter(({ facade }) => (facade ? seaFronts.includes(facade) : true)).length,
    [missions]
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
    <Wrapper isOpen={isOpen}>
      <Menu
        isFixed={isFixed}
        isOpen={isOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isFixed && setIsOpen(false)}
      >
        <Chevron
          data-cy="side-window-sub-menu-trigger"
          onClick={() => setIsFixed(!isFixed)}
          style={chevronStyle(isOpen)}
        >
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
              number={getNumberOfAlertsOrReportingFromSeaFronts(
                ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.OUTREMEROA.seaFronts
              )}
              setSelectedSubMenu={setSelectedSubMenu}
            />
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.OUTREMEROI.code}
              menu={ALERTS_SUBMENU.OUTREMEROI}
              number={getNumberOfAlertsOrReportingFromSeaFronts(
                ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.OUTREMEROI.seaFronts
              )}
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

        {selectedMenu === SideWindowMenuKey.MISSION_LIST && (
          <>
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.MEMN.code}
              menu={ALERTS_SUBMENU.MEMN}
              number={getMissionCountFromSeaFrontGroup(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.MEMN.seaFronts)}
              setSelectedSubMenu={setSelectedSubMenu}
            />
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.NAMO.code}
              menu={ALERTS_SUBMENU.NAMO}
              number={getMissionCountFromSeaFrontGroup(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.NAMO.seaFronts)}
              setSelectedSubMenu={setSelectedSubMenu}
            />
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.SA.code}
              menu={ALERTS_SUBMENU.SA}
              number={getMissionCountFromSeaFrontGroup(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.SA.seaFronts)}
              setSelectedSubMenu={setSelectedSubMenu}
            />
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.MED.code}
              menu={ALERTS_SUBMENU.MED}
              number={getMissionCountFromSeaFrontGroup(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.MED.seaFronts)}
              setSelectedSubMenu={setSelectedSubMenu}
            />
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.OUTREMEROA.code}
              menu={ALERTS_SUBMENU.OUTREMEROA}
              number={getMissionCountFromSeaFrontGroup(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.OUTREMEROA.seaFronts)}
              setSelectedSubMenu={setSelectedSubMenu}
            />
            <SideWindowSubMenuLink
              isOneLine
              isOpen={isOpen}
              isSelected={selectedSubMenu.code === ALERTS_SUBMENU.OUTREMEROI.code}
              menu={ALERTS_SUBMENU.OUTREMEROI}
              number={getMissionCountFromSeaFrontGroup(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS.OUTREMEROI.seaFronts)}
              setSelectedSubMenu={setSelectedSubMenu}
            />
          </>
        )}
      </Menu>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  isOpen: boolean
}>`
  flex-grow: 1;
  position: relative;
  width: ${p => (p.isOpen ? '200px' : '30px')};
`
const Menu = styled.div<{
  isFixed: boolean
  isOpen: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  border-right: 1px solid ${p => p.theme.color.lightGray};
  box-shadow: ${p => (p.isOpen && !p.isFixed ? '#CCCFD6 10px 0px 10px -8px' : 'unset')};
  color: ${p => p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 16;
  font-weight: 500;
  height: 100%;
  padding: 14px 0;
  position: ${p => (p.isFixed ? 'unset' : 'absolute')};
  transition: 'width 0.5s';
  width: ${p => (p.isOpen ? '200px' : '30px')};
  z-index: 999;
`

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
