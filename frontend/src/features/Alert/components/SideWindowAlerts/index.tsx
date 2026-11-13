import { ONE_MINUTE } from '@constants/index'
import { filterBySeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { alertApi } from '@features/Alert/apis'
import { AlertAndReportingTab } from '@features/Alert/components/SideWindowAlerts/AlertListAndReportingList/constants'
import { AlertManagementForm } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm'
import { AlertsManagementList } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useOnPolledQueryData } from '@hooks/useOnPolledQueryData'
import { useCallback } from 'react'

import { AlertListAndReportingList } from './AlertListAndReportingList'
import { AdditionalSubMenu, ALERT_SUB_MENU_OPTIONS } from './constants'
import { SilencedAlerts } from './SilencedAlerts'
import { setPendingAlerts, setSilencedAlerts, setSubMenu } from './slice'
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
  const perSeafrontGroupCount = useMainAppSelector(state => state.reportingTableFilters.perSeafrontGroupCount)

  const pollingOptions = { pollingInterval: ONE_MINUTE, refetchOnMountOrArgChange: ONE_MINUTE / 1000 }
  const operationalAlertsQuery = alertApi.endpoints.getOperationalAlerts.useQuery(undefined, pollingOptions)
  const silencedAlertsQuery = alertApi.endpoints.getSilencedAlerts.useQuery(undefined, pollingOptions)
  useOnPolledQueryData(
    operationalAlertsQuery,
    useCallback(alerts => dispatch(setPendingAlerts(alerts)), [dispatch])
  )
  useOnPolledQueryData(
    silencedAlertsQuery,
    useCallback(silencedAlerts => dispatch(setSilencedAlerts(silencedAlerts)), [dispatch])
  )

  const handleSubMenuChange = useCallback(
    (nextSubMenu: AlertSubMenu) => {
      dispatch(setSubMenu(nextSubMenu))
    },
    [dispatch]
  )

  const countAlertsOrReportingForSeafrontGroup = useCallback(
    (seaFrontGroup: string): number => {
      if (!Object.values(SeafrontGroup).includes(seaFrontGroup as SeafrontGroup)) {
        return 0
      }

      const group = seaFrontGroup as SeafrontGroup
      if (selectedTab === AlertAndReportingTab.ALERT) {
        return filterBySeafrontGroup(pendingAlerts, group, a => a.value.seaFront).length
      }

      if (selectedTab === AlertAndReportingTab.REPORTING) {
        // Counted backend-side over the whole filtered set, before the seafront filter is applied.
        return perSeafrontGroupCount?.[group] ?? 0
      }

      return 0
    },
    [pendingAlerts, perSeafrontGroupCount, selectedTab]
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
