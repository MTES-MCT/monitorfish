import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { SEAFRONT_GROUP_SEAFRONTS, SeafrontGroup } from '@constants/seafront'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { isNotObservationReporting } from '@features/Reporting/utils'
import { useCallback, useState } from 'react'

import { AlertListAndReportingList } from './AlertListAndReportingList'
import { AlertAndReportingTab } from './AlertListAndReportingList/constants'
import { AdditionalSubMenu, ALERT_SUB_MENU_OPTIONS } from './constants'
import { SilencedAlerts } from './SilencedAlerts'
import { setSubMenu } from './slice'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { SubMenu } from '../SubMenu'

import type { AlertSubMenu } from './constants'
import type { MutableRefObject, RefObject } from 'react'

type AlertProps = Readonly<{
  baseRef: RefObject<HTMLDivElement>
}>
export function Alert({ baseRef }: AlertProps) {
  const dispatch = useMainAppDispatch()
  const { pendingAlerts, subMenu } = useMainAppSelector(state => state.alert)
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)

  const { data: currentReportings } = useGetReportingsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  const handleSubMenuChange = useCallback(
    (nextSubMenu: AlertSubMenu) => {
      dispatch(setSubMenu(nextSubMenu))
    },
    [dispatch]
  )

  const countAlertsOrReportingForSeafrontGroup = useCallback(
    (seafront: string): number => {
      const seafronts = SEAFRONT_GROUP_SEAFRONTS[seafront]
      if (!seafronts) {
        return 0
      }

      if (selectedTab === AlertAndReportingTab.ALERT) {
        return pendingAlerts.filter(pendingAlert => seafronts.includes(pendingAlert.value.seaFront)).length
      }

      if (selectedTab === AlertAndReportingTab.REPORTING) {
        return (
          currentReportings?.filter(
            reporting => isNotObservationReporting(reporting) && seafronts.includes(reporting.value.seaFront)
          ).length ?? 0
        )
      }

      return 0
    },
    [currentReportings, pendingAlerts, selectedTab]
  )

  const isSeafrontGroupMenu = Object.values<string>(SeafrontGroup).includes(subMenu)

  return (
    <>
      <SubMenu
        counter={countAlertsOrReportingForSeafrontGroup}
        onChange={handleSubMenuChange}
        options={ALERT_SUB_MENU_OPTIONS}
        value={subMenu}
      />
      {subMenu !== AdditionalSubMenu.SUSPENDED_ALERTS && (
        <AlertListAndReportingList
          baseRef={baseRef as MutableRefObject<HTMLDivElement>}
          selectedSeafrontGroup={isSeafrontGroupMenu ? (subMenu as SeafrontGroup) : SeafrontGroup.MEMN}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      )}
      {subMenu === AdditionalSubMenu.SUSPENDED_ALERTS && <SilencedAlerts />}
    </>
  )
}
