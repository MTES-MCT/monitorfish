import React, { useEffect } from 'react'
import PendingAlertsList from './AlertsList'
import { getAlertForList } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
const Alerts = ({ selectedSubMenu, setSelectedSubMenu, baseRef }) => {
  const {
    alerts,
    focusOnAlert
  } = useSelector(state => state.alert)

  useEffect(() => {
    if (focusOnAlert) {
      const seaFront = focusOnAlert?.value?.seaFront

      const menuSeaFrontName = Object.keys(AlertsMenuSeaFrontsToSeaFrontList)
        .map(menuSeaFrontKey => AlertsMenuSeaFrontsToSeaFrontList[menuSeaFrontKey])
        .find(item => item.seaFronts.includes(seaFront))

      if (menuSeaFrontName) {
        setSelectedSubMenu(AlertsSubMenu[menuSeaFrontName.menuSeaFront])
      }
    }
  }, [focusOnAlert])

  return <>
    <PendingAlertsList
      seaFront={selectedSubMenu?.code}
      alerts={alerts
        .map(alert => getAlertForList(alert))
        .filter(alert =>
          (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront))
      }
      baseRef={baseRef}
    />
  </>
}

export default Alerts
