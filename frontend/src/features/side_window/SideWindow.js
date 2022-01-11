import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import SideWindowMenu from './SideWindowMenu'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { AlertsSubMenu } from '../../domain/entities/alerts'
import SideWindowSubMenu from './SideWindowSubMenu'
import Alerts from './alerts/Alerts'
import { BeaconStatusesSubMenu } from './beacon_statuses/beaconStatuses'
import BeaconStatusesBoard from './beacon_statuses/BeaconStatusesBoard'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import { COLORS } from '../../constants/constants'
import { renderRowExpanded } from './alerts/tableCells'
import { usePrevious } from '../../hooks/usePrevious'
import BeaconStatusDetails from './beacon_statuses/BeaconStatusDetails'
import { beaconStatusStub } from '../../stubs/beaconStatusStub'

const SideWindow = ({ menu }) => {
  const [isPreloading, setIsPreloading] = useState(true)
  const [selectedMenu, setSelectedMenu] = useState(sideWindowMenu.BEACON_STATUSES)
  const previousSelectedMenu = usePrevious(selectedMenu)
  const [selectedSubMenu, setSelectedSubMenu] = useState(selectedMenu === sideWindowMenu.ALERTS
    ? AlertsSubMenu.MEMN
    : BeaconStatusesSubMenu.MALFUNCTIONING)
  const [isOverlayed, setIsOverlayed] = useState(false)

  /**
   * /!\
   * We must preload these components to add the associated `styled-component` styles to the DOM,
   * as they are normally loaded in lazy mode.
   * With this trick, the `react-new-window` module (we use with `<NewWindow/>` component located in `AlertsMapButton.js`)
   * can copy the styles using `document.styleSheets` as they are found in the DOM
   **/
  useEffect(() => {
    setTimeout(() => {
      setIsPreloading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    if (selectedMenu === previousSelectedMenu) {
      return
    }

    if (selectedSubMenu) {
      switch (selectedMenu) {
        case sideWindowMenu.BEACON_STATUSES: {
          setSelectedSubMenu(BeaconStatusesSubMenu.MALFUNCTIONING)
          break
        }
        case sideWindowMenu.ALERTS: {
          setSelectedSubMenu(AlertsSubMenu.MEMN)
          break
        }
      }
    }
  }, [selectedMenu, setSelectedSubMenu])

  useEffect(() => {
    if (menu) {
      setSelectedMenu(menu)
    }
  }, [menu, setSelectedMenu])

  /**
   * /!\
   * The components to preload so we got the associated styles
   **/
  function getComponentsForPreloading () {
    return <NotVisible hidden={true}>
      <Alerts
        selectedSubMenu={AlertsSubMenu.NAMOSA}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <BeaconStatusesBoard/>
      {renderRowExpanded()}
      <SideWindowSubMenu
        selectedMenu={sideWindowMenu.ALERTS}
        selectedSubMenu={AlertsSubMenu.NAMOSA}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <BeaconStatusDetails beaconStatus={beaconStatusStub}/>
      <BeaconStatusesBoardGrayOverlay isOverlayed={true}/>
    </NotVisible>
  }

  return <Wrapper>
    <SideWindowMenu
      selectedMenu={selectedMenu}
      setSelectedMenu={setSelectedMenu}
    />
    <SideWindowSubMenu
      selectedMenu={selectedMenu}
      selectedSubMenu={selectedSubMenu}
      setSelectedSubMenu={setSelectedSubMenu}
    />
    {
      isPreloading
        ? getComponentsForPreloading()
        : null
    }
    <BeaconStatusesBoardGrayOverlay
      isOverlayed={isOverlayed}
      onClick={() => setIsOverlayed(false)}
    />
    {
      isPreloading
        ? <Loading>
          <FulfillingBouncingCircleSpinner
            color={COLORS.grayShadow}
            className={'update-vessels'}
            size={100}/>
          <Text data-cy={'first-loader'}>Chargement...</Text>
        </Loading>
        : <>
          {
            selectedMenu === sideWindowMenu.ALERTS &&
            <Alerts
              selectedSubMenu={selectedSubMenu}
              setSelectedSubMenu={setSelectedSubMenu}
            />
          }
          {
            selectedMenu === sideWindowMenu.BEACON_STATUSES &&
            <BeaconStatusesBoard
              setIsOverlayed={setIsOverlayed}
              isOverlayed={isOverlayed}
            />
          }
        </>
    }
  </Wrapper>
}

export const BeaconStatusesBoardGrayOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: ${props => props.isOverlayed ? 0.5 : 0};
  background: ${COLORS.charcoal};
  z-index: ${props => props.isOverlayed ? 11 : -9999};
`

const Loading = styled.div`
  margin-top: 350px;
  margin-left: 550px;
`

const Text = styled.span`
  margin-top: 10px;
  font-size: 13px;
  color: ${COLORS.grayShadow};
  bottom: -17px;
  position: relative;
`

const NotVisible = styled.div`
  opacity: 0;
`

const Wrapper = styled.div`
  display: flex;
`

export default SideWindow
