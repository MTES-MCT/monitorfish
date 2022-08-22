import React, { forwardRef, useEffect, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'

import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { AlertsSubMenu } from '../../domain/entities/alerts'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { setEditedReportingInSideWindow } from '../../domain/shared_slices/Reporting'
import getOperationalAlerts from '../../domain/use_cases/alert/getOperationalAlerts'
import getSilencedAlerts from '../../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getAllCurrentReportings from '../../domain/use_cases/reporting/getAllCurrentReportings'
import { usePrevious } from '../../hooks/usePrevious'
import AlertsAndReportings from './alerts_reportings/AlertsAndReportings'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import BeaconMalfunctionsBoard from './beacon_malfunctions/BeaconMalfunctionsBoard'
import SideWindowMenu from './SideWindowMenu'
import SideWindowSubMenu from './SideWindowSubMenu'

const SideWindow = forwardRef((isFromURL, ref) => {
  const openedSideWindowTab = useSelector(state => state.global.openedSideWindowTab)
  const openedBeaconMalfunctionInKanban = useSelector(state => state.beaconMalfunction.openedBeaconMalfunctionInKanban)
  const editedReportingInSideWindow = useSelector(state => state.reporting.editedReportingInSideWindow)
  const focusOnAlert = useSelector(state => state.alert.focusOnAlert)
  const dispatch = useDispatch()
  const [isPreloading, setIsPreloading] = useState(true)
  const previousOpenedSideWindowTab = usePrevious(openedSideWindowTab)
  const [selectedSubMenu, setSelectedSubMenu] = useState(
    openedSideWindowTab === sideWindowMenu.ALERTS.code ? AlertsSubMenu.MEMN : BeaconMalfunctionsSubMenu.MALFUNCTIONING
  )
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [subMenuIsFixed, setSubMenuIsFixed] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsPreloading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (editedReportingInSideWindow || openedBeaconMalfunctionInKanban) {
      setIsOverlayed(true)

      return
    }

    setIsOverlayed(false)
  }, [openedBeaconMalfunctionInKanban, editedReportingInSideWindow, openedSideWindowTab])

  useEffect(() => {
    if (isFromURL) {
      dispatch(getOperationalAlerts())
      dispatch(getAllBeaconMalfunctions())
      dispatch(getSilencedAlerts())
      dispatch(getAllCurrentReportings())

      dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))
    }
  }, [isFromURL])

  useEffect(() => {
    if (openedSideWindowTab === previousOpenedSideWindowTab) {
      return
    }

    if (selectedSubMenu) {
      switch (openedSideWindowTab) {
        case sideWindowMenu.BEACON_MALFUNCTIONS.code: {
          setSelectedSubMenu(BeaconMalfunctionsSubMenu.MALFUNCTIONING)
          break
        }
        case sideWindowMenu.ALERTS.code: {
          setSelectedSubMenu(AlertsSubMenu[focusOnAlert?.value?.seaFront] || AlertsSubMenu.MEMN)
          break
        }
      }
    }
  }, [openedSideWindowTab, setSelectedSubMenu, focusOnAlert])

  function closeRightSidebar() {
    dispatch(closeBeaconMalfunctionInKanban())
    dispatch(setEditedReportingInSideWindow(null))
  }

  const beaconMalfunctionBoardGrayOverlayStyle = {
    background: COLORS.charcoal,
    height: '100%',
    opacity: isOverlayed ? 0.5 : 0,
    position: 'absolute',
    width: '100%',
    zIndex: isOverlayed ? 11 : -9999
  }

  return (
    <Wrapper ref={ref}>
      <SideWindowMenu selectedMenu={openedSideWindowTab} />
      <SideWindowSubMenu
        fixed={subMenuIsFixed}
        selectedMenu={openedSideWindowTab}
        selectedSubMenu={selectedSubMenu}
        selectedTab={selectedTab}
        setIsFixed={setSubMenuIsFixed}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <BeaconMalfunctionsBoardGrayOverlay onClick={closeRightSidebar} style={beaconMalfunctionBoardGrayOverlayStyle} />
      {isPreloading && (
        <Loading>
          <FulfillingBouncingCircleSpinner className="update-vessels" color={COLORS.grayShadow} size={100} />
          <Text data-cy="first-loader">Chargement...</Text>
        </Loading>
      )}
      {!isPreloading && (
        <Content height={self.innerHeight + 50} isFixed={subMenuIsFixed}>
          {openedSideWindowTab === sideWindowMenu.ALERTS.code && (
            <AlertsAndReportings
              baseRef={ref}
              selectedSubMenu={selectedSubMenu}
              selectedTab={selectedTab}
              setSelectedSubMenu={setSelectedSubMenu}
              setSelectedTab={setSelectedTab}
            />
          )}
          {openedSideWindowTab === sideWindowMenu.BEACON_MALFUNCTIONS.code && <BeaconMalfunctionsBoard baseRef={ref} />}
        </Content>
      )}
    </Wrapper>
  )
})

export const AlertAndReportingTab = {
  ALERT: 'ALERT',
  REPORTING: 'REPORTING'
}

const Content = styled.div`
  margin-left: ${p => (p.fixed ? 0 : 30)}px;
  width: 100%;
  height: ${p => p.height}px;
  min-height: 1000px;
  overflow: auto;
`

const BeaconMalfunctionsBoardGrayOverlay = styled.div``

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
    0% {
      background: ${COLORS.background};
    }
    50% {
      background: ${COLORS.lightGray};
    }
    0% {
      background: ${COLORS.background};
    }
  }

  @keyframes close-alert-transition-item {
    60% {
      height: 15px;
      margin: 6px 0px 6px 0px;
      padding: 13px 0px 13px 0px;
      border-width: 1px;
    }
    100% {
      height: 0px;
      margin: 0px 0px 0px 0px;
      padding: 0px 0px 0px 0px;
      border-width: 0px;
    }
  }

  .loader {
    width: 15px;
    height: 15px;
    border: 2px solid #707785;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    margin-right: 5px;
    margin-top: 2px;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export default SideWindow
