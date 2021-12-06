import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import AlertsWindowFirstMenu from './AlertsWindowFirstMenu'
import AlertsWindowSecondMenu from './AlertsWindowSecondMenu'
import AlertsWindowBody from './AlertsWindowBody'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, MenuSeaFronts } from '../../../domain/entities/alerts'

const AlertsWindow = () => {
  const {
    focusOnAlert
  } = useSelector(state => state.alert)
  const [selectedMenuSeaFront, setSelectedMenuSeaFront] = useState(MenuSeaFronts.MEMN)
  const baseUrl = window.location.origin

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

  return <Wrapper>
    <AlertsWindowFirstMenu/>
    <AlertsWindowSecondMenu
      selectedMenuSeaFront={selectedMenuSeaFront}
      setSelectedMenuSeaFront={setSelectedMenuSeaFront}
    />
    <AlertsWindowBody
      selectedMenuSeaFront={selectedMenuSeaFront}
      baseUrl={baseUrl}
    />
  </Wrapper>
}

const Wrapper = styled.div`
  display: flex;
`

export default AlertsWindow
