import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import NewWindow from 'react-new-window'

import AlertsWindowFirstMenu from './AlertsWindowFirstMenu'
import AlertsWindowSecondMenu from './AlertsWindowSecondMenu'
import AlertsWindowBody from './AlertsWindowBody'
import { useDispatch, useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, MenuSeaFronts } from '../../../domain/entities/alerts'
import { resetFocusOnAlert } from '../../../domain/shared_slices/Alert'

const AlertsWindow = ({ baseUrl, isOpen, closeAlertList }) => {
  const dispatch = useDispatch()
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

  return isOpen
    ? <NewWindow
      name={'Alertes'}
      title={'Alertes'}
      features={{ width: '1200px', height: '900px' }}
      onUnload={() => {
        closeAlertList()
        dispatch(resetFocusOnAlert())
      }}
    >
      <Wrapper>
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
    </NewWindow>
    : null
}

const Wrapper = styled.div`
  display: flex;
`

export default AlertsWindow
