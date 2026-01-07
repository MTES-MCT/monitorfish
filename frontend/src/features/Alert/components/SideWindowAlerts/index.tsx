import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { NO_SEAFRONT_GROUP, SEAFRONT_GROUP_SEAFRONTS, SeafrontGroup } from '@constants/seafront'
import { AlertAndReportingTab } from '@features/Alert/components/SideWindowAlerts/AlertListAndReportingList/constants'
import { AlertManagementForm } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm'
import { AlertsManagementList } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback } from 'react'

import { AlertListAndReportingList } from './AlertListAndReportingList'
import { AdditionalSubMenu, ALERT_SUB_MENU_OPTIONS } from './constants'
import { SilencedAlerts } from './SilencedAlerts'
import { setSubMenu } from './slice'
import { SubMenu } from '../../../SideWindow/SubMenu'

import type { AlertSubMenu } from './constants'

type SideWindowAlertsProps = Readonly<{
  isFromUrl: boolean
}>
export function SideWindowAlerts({ isFromUrl }: SideWindowAlertsProps) {
  const dispatch = useMainAppDispatch()
  const pendingAlerts = useMainAppSelector(state => state.alert.pendingAlerts)
  const editedAlertSpecification = useMainAppSelector(state => state.alert.editedAlertSpecification)
  const subMenu = useMainAppSelector(state => state.alert.subMenu)
  const selectedTab = useMainAppSelector(state => state.alert.selectedTab)
  const reportingTypesDisplayed = useMainAppSelector(state => state.reportingTableFilters.reportingTypesDisplayed)

  const { data: currentReportings } = useGetReportingsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  const handleSubMenuChange = useCallback(
    (nextSubMenu: AlertSubMenu) => {
      dispatch(setSubMenu(nextSubMenu))
    },
    [dispatch]
  )

  const countAlertsOrReportingForSeafrontGroup = useCallback(
    (seaFrontGroup: string): number => {
      if (seaFrontGroup === NO_SEAFRONT_GROUP && selectedTab === AlertAndReportingTab.ALERT) {
        return pendingAlerts.filter(pendingAlert => !pendingAlert.value.seaFront).length
      }

      if (seaFrontGroup === NO_SEAFRONT_GROUP && selectedTab === AlertAndReportingTab.REPORTING) {
        return (
          currentReportings
            ?.filter(reporting => !reporting.value.seaFront)
            ?.filter(reporting => reportingTypesDisplayed.includes(reporting.type))?.length ?? 0
        )
      }

      const seafronts = SEAFRONT_GROUP_SEAFRONTS[seaFrontGroup]
      if (!seafronts) {
        return 0
      }

      if (selectedTab === AlertAndReportingTab.ALERT) {
        return pendingAlerts.filter(pendingAlert => seafronts.includes(pendingAlert.value.seaFront)).length
      }

      if (selectedTab === AlertAndReportingTab.REPORTING) {
        return (
          currentReportings
            ?.filter(reporting => seafronts.includes(reporting.value.seaFront))
            ?.filter(reporting => reportingTypesDisplayed.includes(reporting.type))?.length ?? 0
        )
      }

      return 0
    },
    [currentReportings, pendingAlerts, reportingTypesDisplayed, selectedTab]
  )

  return (
    <>
      <SubMenu
        counter={countAlertsOrReportingForSeafrontGroup}
        onChange={handleSubMenuChange}
        options={ALERT_SUB_MENU_OPTIONS}
        value={subMenu}
      />
      {subMenu !== AdditionalSubMenu.SUSPENDED_ALERTS && subMenu !== AdditionalSubMenu.ALERT_MANAGEMENT && (
        <AlertListAndReportingList isFromUrl={isFromUrl} selectedSeafrontGroup={subMenu || SeafrontGroup.MEMN} />
      )}
      {subMenu === AdditionalSubMenu.SUSPENDED_ALERTS && <SilencedAlerts />}
      {subMenu === AdditionalSubMenu.ALERT_MANAGEMENT && !editedAlertSpecification && <AlertsManagementList />}
      {subMenu === AdditionalSubMenu.ALERT_MANAGEMENT && !!editedAlertSpecification && <AlertManagementForm />}
    </>
  )
}
