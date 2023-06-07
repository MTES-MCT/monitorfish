import { THEME, type NewWindowContextValue, NewWindowContext, usePrevious, Notifier } from '@mtes-mct/monitor-ui'
import { propEq } from 'ramda'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled, { createGlobalStyle } from 'styled-components'

import { AlertListAndReportingList } from './AlertListAndReportingList'
import { BeaconMalfunctionBoard } from './BeaconMalfunctionBoard'
import { BeaconMalfunctionsSubMenu } from './BeaconMalfunctionBoard/beaconMalfunctions'
import { AlertAndReportingTab } from './constants'
import { Menu } from './Menu'
import { MissionForm } from './MissionForm'
import { MissionList } from './MissionList'
import { SideWindowSubMenu } from './SideWindowSubMenu'
import { getSelectedSubMenu } from './utils'
import { ALERTS_SUBMENU } from '../../domain/entities/alerts/constants'
import { SeaFrontGroup } from '../../domain/entities/seaFront/constants'
import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { setEditedReportingInSideWindow } from '../../domain/shared_slices/Reporting'
import { getOperationalAlerts } from '../../domain/use_cases/alert/getOperationalAlerts'
import { getSilencedAlerts } from '../../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getAllGearCodes from '../../domain/use_cases/gearCode/getAllGearCodes'
import { getFishingInfractions } from '../../domain/use_cases/infraction/getFishingInfractions'
import { getAllCurrentReportings } from '../../domain/use_cases/reporting/getAllCurrentReportings'
import { sideWindowDispatchers } from '../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { MenuItem } from '../../types'
import type { MutableRefObject, CSSProperties, ForwardedRef, HTMLAttributes } from 'react'

export type SideWindowProps = HTMLAttributes<HTMLDivElement> & {
  isFromURL: boolean
}
function SideWindowWithRef({ isFromURL }: SideWindowProps, ref: ForwardedRef<HTMLDivElement | null>) {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const { sideWindow } = useMainAppSelector(state => state)

  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [isPreloading, setIsPreloading] = useState(true)
  const [isSubmenuFixed, setIsSubmenuFixed] = useState(false)
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem<SeaFrontGroup | string>>(
    getSelectedSubMenu(sideWindow.selectedPath.menu)
  )
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)

  const openedBeaconMalfunctionInKanban = useMainAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const { editedReportingInSideWindow } = useMainAppSelector(state => state.reporting)
  const { focusedPendingAlertId, pendingAlerts } = useMainAppSelector(state => state.alert)
  const dispatch = useMainAppDispatch()
  const previousOpenedSideWindowTab = usePrevious(sideWindow.selectedPath.menu)

  const beaconMalfunctionBoardGrayOverlayStyle: CSSProperties = useMemo(
    () => ({
      background: THEME.color.charcoal,
      height: '100%',
      opacity: isOverlayed ? 0.5 : 0,
      position: 'absolute',
      width: '100%',
      zIndex: isOverlayed ? 11 : -9999
    }),
    [isOverlayed]
  )

  const hasSubmenu = useMemo(
    () =>
      [SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST, SideWindowMenuKey.BEACON_MALFUNCTION_BOARD].includes(
        sideWindow.selectedPath.menu
      ),
    [sideWindow.selectedPath.menu]
  )

  const newWindowContextProviderValue: NewWindowContextValue = useMemo(
    () => ({
      newWindowContainerRef: wrapperRef.current
        ? (wrapperRef as MutableRefObject<HTMLDivElement>)
        : {
            current: window.document.createElement('div')
          }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFirstRender]
  )

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => wrapperRef.current)

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
  }, [openedBeaconMalfunctionInKanban, editedReportingInSideWindow, sideWindow.selectedPath.menu])

  useEffect(() => {
    if (isFromURL) {
      dispatch(getOperationalAlerts())
      dispatch(getAllBeaconMalfunctions())
      dispatch(getSilencedAlerts())
      dispatch(getAllCurrentReportings())
      dispatch(getFishingInfractions())
      dispatch(getAllGearCodes())

      dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
    }
  }, [dispatch, isFromURL])

  useEffect(() => {
    if (
      sideWindow.selectedPath.menu === previousOpenedSideWindowTab ||
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_LIST
    ) {
      return
    }

    if (selectedSubMenu) {
      switch (sideWindow.selectedPath.menu) {
        case SideWindowMenuKey.BEACON_MALFUNCTION_BOARD:
          setSelectedSubMenu(BeaconMalfunctionsSubMenu.MALFUNCTIONING as unknown as MenuItem<SeaFrontGroup>)
          break

        case SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST:
          {
            if (!focusedPendingAlertId) {
              setSelectedSubMenu(ALERTS_SUBMENU.MEMN)

              return
            }

            const focusedPendingAlert = pendingAlerts.find(propEq(focusedPendingAlertId, 'id'))
            if (!focusedPendingAlert) {
              setSelectedSubMenu(ALERTS_SUBMENU.MEMN)

              return
            }

            setSelectedSubMenu(ALERTS_SUBMENU[focusedPendingAlert.value.seaFront] || ALERTS_SUBMENU.MEMN)
          }
          break
        default:
          // throw new Error('This should never happen.')
          // eslint-disable-next-line no-useless-return
          return
      }
    }
  }, [
    focusedPendingAlertId,
    pendingAlerts,
    previousOpenedSideWindowTab,
    selectedSubMenu,
    setSelectedSubMenu,
    sideWindow.selectedPath.menu
  ])

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return (
    <Wrapper ref={wrapperRef}>
      {!isFirstRender && (
        <NewWindowContext.Provider value={newWindowContextProviderValue}>
          <GlobalStyle />

          <Menu selectedMenu={sideWindow.selectedPath.menu} />
          {hasSubmenu && (
            <SideWindowSubMenu
              isFixed={isSubmenuFixed}
              selectedMenu={sideWindow.selectedPath.menu}
              selectedSubMenu={selectedSubMenu}
              selectedTab={selectedTab}
              setIsFixed={setIsSubmenuFixed}
              setSelectedSubMenu={setSelectedSubMenu}
            />
          )}
          {/* TODO Move that within BeaconMalfunctionBoard. */}
          {sideWindow.selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD && (
            <BeaconMalfunctionsBoardGrayOverlay
              onClick={closeRightSidebar}
              style={beaconMalfunctionBoardGrayOverlayStyle}
            />
          )}
          {isPreloading && (
            <Loading>
              <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.lightGray} size={100} />
              <Text data-cy="first-loader">Chargement...</Text>
            </Loading>
          )}
          {!isPreloading && (
            <Content
              noMargin={
                sideWindow.selectedPath.menu &&
                [SideWindowMenuKey.MISSION_FORM, SideWindowMenuKey.MISSION_LIST].includes(sideWindow.selectedPath.menu)
              }
            >
              {sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST && (
                <AlertListAndReportingList
                  baseRef={wrapperRef as MutableRefObject<HTMLDivElement>}
                  selectedSubMenu={
                    Object.values<string>(SeaFrontGroup).includes(selectedSubMenu.code)
                      ? (selectedSubMenu as MenuItem<SeaFrontGroup>)
                      : ALERTS_SUBMENU.MEMN
                  }
                  selectedTab={selectedTab}
                  setSelectedSeaFront={setSelectedSubMenu as any}
                  setSelectedTab={setSelectedTab}
                />
              )}
              {sideWindow.selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD && (
                <BeaconMalfunctionBoard />
              )}
              {sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_LIST && <MissionList />}
              {sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM && <MissionForm />}
            </Content>
          )}

          <Notifier isSideWindow />
        </NewWindowContext.Provider>
      )}
    </Wrapper>
  )
}

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }
`

// All containers within this SideWindow root wrapper should now only use flexboxes
const Wrapper = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
  height: 100%;
  min-height: 0;
  min-width: 0;

  @keyframes blink {
    0% {
      background: ${p => p.theme.color.white};
    }

    50% {
      background: ${p => p.theme.color.lightGray};
    }

    100% {
      background: ${p => p.theme.color.white};
    }
  }

  @keyframes close-alert-transition-item {
    60% {
      border-width: 1px;
      height: 15px;
      margin: 6px 0;
      padding: 13px 0;
    }

    100% {
      border-width: 0;
      height: 0;
      margin: 0;
      padding: 0;
    }
  }

  .loader {
    animation: rotation 1s linear infinite;
    border: 2px solid #707785;
    border-bottom-color: transparent;
    border-radius: 50%;
    box-sizing: border-box;
    display: inline-block;
    height: 15px;
    margin-right: 5px;
    margin-top: 2px;
    width: 15px;
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

const Content = styled.div<{
  noMargin: boolean | undefined
}>`
  display: flex;
  flex-grow: 1;
  min-height: 0;
  min-width: 0;
  padding-left: ${p => (p.noMargin ? 0 : '30px')};
`

const BeaconMalfunctionsBoardGrayOverlay = styled.div``

const Loading = styled.div`
  margin-left: 550px;
  margin-top: 350px;
`

const Text = styled.span`
  bottom: -17px;
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  margin-top: 10px;
  position: relative;
`

export const SideWindow = forwardRef(SideWindowWithRef)
