import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { AlertsSubMenu } from '../../domain/entities/alerts'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { setEditedReportingInSideWindow } from '../../domain/shared_slices/Reporting'
import { getOperationalAlerts } from '../../domain/use_cases/alert/getOperationalAlerts'
import getSilencedAlerts from '../../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getAllCurrentReportings from '../../domain/use_cases/reporting/getAllCurrentReportings'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { usePrevious } from '../../hooks/usePrevious'
import { AlertsAndReportings } from './alerts_reportings/AlertsAndReportings'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import BeaconMalfunctionsBoard from './beacon_malfunctions/BeaconMalfunctionsBoard'
import { AlertAndReportingTab } from './constants'
import { SideWindowMenu } from './SideWindowMenu'
import { SideWindowSubMenu } from './SideWindowSubMenu'

import type { PendingAlert } from '../../domain/types/alert'
import type { MenuItem } from './types'
import type { CSSProperties, ForwardedRef } from 'react'

export type SideWindowProps = {
  isFromURL: boolean
}
function SideWindowWithRef({ isFromURL }: SideWindowProps, ref: ForwardedRef<HTMLDivElement>) {
  const openedSideWindowTab = useAppSelector(state => state.global.openedSideWindowTab)
  const openedBeaconMalfunctionInKanban = useAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const editedReportingInSideWindow = useAppSelector(state => state.reporting.editedReportingInSideWindow)
  const focusOnAlert = useAppSelector(state => state.alert.focusOnAlert)
  const dispatch = useAppDispatch()
  const [isPreloading, setIsPreloading] = useState(true)
  const previousOpenedSideWindowTab = usePrevious(openedSideWindowTab)
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem>(
    !openedSideWindowTab || openedSideWindowTab === sideWindowMenu.ALERTS.code
      ? AlertsSubMenu.MEMN
      : BeaconMalfunctionsSubMenu.MALFUNCTIONING
  )
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [subMenuIsFixed, setSubMenuIsFixed] = useState(false)

  const closeRightSidebar = useCallback(() => {
    dispatch(closeBeaconMalfunctionInKanban())
    dispatch(setEditedReportingInSideWindow())
  }, [dispatch])

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
      dispatch(getOperationalAlerts() as any)
      dispatch(getAllBeaconMalfunctions() as any)
      dispatch(getSilencedAlerts() as any)
      dispatch(getAllCurrentReportings() as any)

      dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))
    }
  }, [dispatch, isFromURL])

  useEffect(() => {
    if (openedSideWindowTab === previousOpenedSideWindowTab) {
      return
    }

    if (selectedSubMenu) {
      switch (openedSideWindowTab) {
        case sideWindowMenu.BEACON_MALFUNCTIONS.code:
          setSelectedSubMenu(BeaconMalfunctionsSubMenu.MALFUNCTIONING)
          break

        case sideWindowMenu.ALERTS.code:
          if (focusOnAlert) {
            // TODO Remove the `as` as soon as the discriminator is added.
            setSelectedSubMenu(AlertsSubMenu[(focusOnAlert.value as PendingAlert).seaFront] || AlertsSubMenu.MEMN)
          }
          break

        default:
          throw new Error('This should never happen.')
      }
    }
  }, [focusOnAlert, openedSideWindowTab, previousOpenedSideWindowTab, selectedSubMenu, setSelectedSubMenu])

  const beaconMalfunctionBoardGrayOverlayStyle: CSSProperties = useMemo(
    () => ({
      background: COLORS.charcoal,
      height: '100%',
      opacity: isOverlayed ? 0.5 : 0,
      position: 'absolute',
      width: '100%',
      zIndex: isOverlayed ? 11 : -9999
    }),
    [isOverlayed]
  )

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
        <Content height={window.innerHeight + 50} isFixed={subMenuIsFixed}>
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
}

const Content = styled.div<{
  height: number
  isFixed: boolean
}>`
  margin-left: ${p => (p.isFixed ? 0 : 30)}px;
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

export const SideWindow = forwardRef(SideWindowWithRef)
