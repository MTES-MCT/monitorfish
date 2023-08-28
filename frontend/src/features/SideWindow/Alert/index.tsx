import { MutableRefObject, RefObject, useCallback, useState } from 'react'

import { AlertListAndReportingList } from './AlertListAndReportingList'
import { AlertAndReportingTab } from './AlertListAndReportingList/constants'
import { AdditionalSubMenu, ALERT_SUB_MENU_OPTIONS, AlertSubMenu } from './constants'
import { SilencedAlerts } from './SilencedAlerts'
import { setSubMenu } from './slice'
import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFrontGroup } from '../../../domain/entities/seaFront/constants'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { SubMenu } from '../SubMenu'

type AlertProps = {
  baseRef: RefObject<HTMLDivElement>
}
export function Alert({ baseRef }: AlertProps) {
  const dispatch = useMainAppDispatch()
  const { pendingAlerts, subMenu } = useMainAppSelector(state => state.alert)
  const { currentReportings } = useMainAppSelector(state => state.reporting)
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)

  const handleSubMenuChange = useCallback(
    (nextSubMenu: AlertSubMenu) => {
      dispatch(setSubMenu(nextSubMenu))
    },
    [dispatch]
  )

  const countAlertsOrReportingForSeaFrontGroup = useCallback(
    (seaFront: string): number => {
      const seaFronts = SEA_FRONT_GROUP_SEA_FRONTS[seaFront]
      if (!seaFronts) {
        return 0
      }

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

  const isSeaFrontGroupMenu = Object.values<string>(SeaFrontGroup).includes(subMenu)

  return (
    <>
      <SubMenu
        counter={countAlertsOrReportingForSeaFrontGroup}
        onChange={handleSubMenuChange}
        options={ALERT_SUB_MENU_OPTIONS}
        value={subMenu}
      />

      {isSeaFrontGroupMenu && (
        <AlertListAndReportingList
          baseRef={baseRef as MutableRefObject<HTMLDivElement>}
          selectedSubMenu={isSeaFrontGroupMenu ? (subMenu as SeaFrontGroup) : SeaFrontGroup.MEMN}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      )}
      {subMenu === AdditionalSubMenu.SUSPENDED_ALERTS && <SilencedAlerts />}
    </>
  )
}
