import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, MenuSeaFronts } from '../../../domain/entities/alerts'
import AlertsMenu from './AlertsMenu'
import AlertsBody from './AlertsBody'

const Alerts = () => {
  const {
    focusOnAlert
  } = useSelector(state => state.alert)
  const [selectedMenuSeaFront, setSelectedMenuSeaFront] = useState(MenuSeaFronts.MEMN)

  useEffect(() => {
    if (focusOnAlert) {
      const seaFront = focusOnAlert?.value?.seaFront

      const menuSeaFrontName = Object.keys(AlertsMenuSeaFrontsToSeaFrontList)
        .map(menuSeaFrontKey => AlertsMenuSeaFrontsToSeaFrontList[menuSeaFrontKey])
        .find(item => item.seaFronts.includes(seaFront))

      if (menuSeaFrontName) {
        setSelectedMenuSeaFront(MenuSeaFronts[menuSeaFrontName.menuSeaFront])
      }
    }
  }, [focusOnAlert])

  return <>
    <AlertsMenu
      selectedMenuSeaFront={selectedMenuSeaFront}
      setSelectedMenuSeaFront={setSelectedMenuSeaFront}
    />
    <AlertsBody
      selectedMenuSeaFront={selectedMenuSeaFront}
    />
  </>
}

export default Alerts
