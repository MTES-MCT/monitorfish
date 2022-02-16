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
import { usePrevious } from '../../hooks/usePrevious'
import { useDispatch, useSelector } from 'react-redux'
import { openSideWindowTab, setSideWindowAsOpen } from '../../domain/shared_slices/Global'
import getOperationalAlerts from '../../domain/use_cases/getOperationalAlerts'
import getAllBeaconStatuses from '../../domain/use_cases/getAllBeaconStatuses'
import { closeBeaconStatus } from '../../domain/shared_slices/BeaconStatus'

const SideWindow = ({ fromTab }) => {
  const {
    openedSideWindowTab
  } = useSelector(state => state.global)
  const {
    beaconStatuses,
    openedBeaconStatus
  } = useSelector(state => state.beaconStatus)
  const {
    alerts,
    focusOnAlert
  } = useSelector(state => state.alert)
  const dispatch = useDispatch()
  const [isPreloading, setIsPreloading] = useState(true)
  const previousOpenedSideWindowTab = usePrevious(openedSideWindowTab)
  const [selectedSubMenu, setSelectedSubMenu] = useState(openedSideWindowTab === sideWindowMenu.ALERTS.code
    ? AlertsSubMenu.MEMN
    : BeaconStatusesSubMenu.MALFUNCTIONING)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [subMenuIsFixed, setSubMenuIsFixed] = useState(false)

  useEffect(() => {
    if (openedSideWindowTab) {
      dispatch(setSideWindowAsOpen())

      setTimeout(() => {
        setIsPreloading(false)
      }, 500)
    }
  }, [openedSideWindowTab])

  useEffect(() => {
    if (setIsOverlayed) {
      setIsOverlayed(!!openedBeaconStatus)
    }

    if (openedSideWindowTab === sideWindowMenu.ALERTS.code) {
      setIsOverlayed(false)
    }
  }, [openedBeaconStatus, openedSideWindowTab])

  useEffect(() => {
    if (fromTab) {
      dispatch(getOperationalAlerts())
      dispatch(getAllBeaconStatuses())

      dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))
    }
  }, [fromTab])

  useEffect(() => {
    if (openedSideWindowTab === previousOpenedSideWindowTab) {
      return
    }

    if (selectedSubMenu) {
      switch (openedSideWindowTab) {
        case sideWindowMenu.BEACON_STATUSES.code: {
          setSelectedSubMenu(BeaconStatusesSubMenu.MALFUNCTIONING)
          break
        }
        case sideWindowMenu.ALERTS.code: {
          setSelectedSubMenu(AlertsSubMenu[focusOnAlert?.value?.seaFront] || AlertsSubMenu.MEMN)
          break
        }
      }
    }
  }, [openedSideWindowTab, setSelectedSubMenu, focusOnAlert])

  const beaconStatusBoardGrayOverlayStyle = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    opacity: isOverlayed ? 0.5 : 0,
    background: COLORS.charcoal,
    zIndex: isOverlayed ? 11 : -9999
  }

  return <>{openedSideWindowTab
    ? <Wrapper>
      <SideWindowMenu
        selectedMenu={openedSideWindowTab}
      />
      <SideWindowSubMenu
        beaconStatuses={beaconStatuses}
        alerts={alerts}
        selectedMenu={openedSideWindowTab}
        selectedSubMenu={selectedSubMenu}
        setSelectedSubMenu={setSelectedSubMenu}
        fixed={subMenuIsFixed}
        setIsFixed={setSubMenuIsFixed}
      />
      <BeaconStatusesBoardGrayOverlay
        style={beaconStatusBoardGrayOverlayStyle}
        onClick={() => dispatch(closeBeaconStatus())}
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
          : <Content style={contentStyle(subMenuIsFixed)}>
            {
              openedSideWindowTab === sideWindowMenu.ALERTS.code &&
              <Alerts
                selectedSubMenu={selectedSubMenu}
                setSelectedSubMenu={setSelectedSubMenu}
              />
            }
            {
              openedSideWindowTab === sideWindowMenu.BEACON_STATUSES.code &&
              <BeaconStatusesBoard/>
            }
          </Content>
      }
    </Wrapper>
    : null
  }
  </>
}

const Content = styled.div``
const contentStyle = fixed => ({
  marginLeft: fixed ? 0 : 30
})

const BeaconStatusesBoardGrayOverlay = styled.div``

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

const Wrapper = styled.div`
  display: flex;
  background: ${COLORS.white};
  
  @keyframes blink {
    0%   {
      background: ${COLORS.background};
    }
    50% {
      background: ${COLORS.lightGray};
    }
    0% {
      background: ${COLORS.background};
    }
  }
  
  .rs-btn rs-btn-default rs-picker-toggle {
    background: #1675e0 !important;
  }
  .rs-picker-toggle-wrapper {
    display: block;
  }
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active, .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover, .rs-picker-select-menu-item.rs-picker-select-menu-item-focus, .rs-picker-select-menu-item {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
  }
  .rs-picker-select-menu-items {
    overflow-y: unset;
  }
  .rs-picker-select {
    width: 155px !important;
    margin: 8px 10px 0 10px !important;
    background: ${props => props.background};
    height: 30px;
  }
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn {
    padding-right: 27px;
    padding-left: 10px;
    height: 15px;
    padding-top: 5px;
    padding-bottom: 8px;
  }
  .rs-picker-toggle.rs-btn {
    padding-left: 5px !important;
  }
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret, .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }
  
  .rs-btn-toggle {
    background: #C8DCE6 0% 0% no-repeat padding-box;
    border: 1px solid #707785;
    border-radius: 7px;
    margin: 3px 7px 0 7px;
  }
  .rs-btn-toggle::after {
    background: ${COLORS.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
  
  .rs-list-item {
    box-shadow: unset;
  }
`

export default SideWindow
