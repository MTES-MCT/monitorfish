import { THEME } from '@mtes-mct/monitor-ui'
import { propEq } from 'ramda'
import {
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { AlertsAndReportings } from './alerts_reportings/AlertsAndReportings'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { BeaconMalfunctionsBoard } from './beacon_malfunctions/BeaconMalfunctionsBoard'
import { AlertAndReportingTab, SideWindowMenuKey } from './constants'
import { MissionForm } from './MissionForm'
import { MissionList } from './MissionList'
import { SideWindowMenu } from './SideWindowMenu'
import { SideWindowSubMenu } from './SideWindowSubMenu'
import { getSelectedSubMenu } from './utils'
import { ALERTS_SUBMENU, SeaFront } from '../../domain/entities/alerts/constants'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { setEditedReportingInSideWindow } from '../../domain/shared_slices/Reporting'
import { getOperationalAlerts } from '../../domain/use_cases/alert/getOperationalAlerts'
import { getSilencedAlerts } from '../../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getFishingInfractions from '../../domain/use_cases/infraction/getFishingInfractions'
import { getAllCurrentReportings } from '../../domain/use_cases/reporting/getAllCurrentReportings'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { usePrevious } from '../../hooks/usePrevious'
import { NewWindowContext } from '../../ui/NewWindow'

import type { MenuItem } from '../../types'
import type { NewWindowContextValue } from '../../ui/NewWindow'
import type { CSSProperties, ForwardedRef, HTMLAttributes } from 'react'

export type SideWindowProps = HTMLAttributes<HTMLDivElement> & {
  isFromURL: boolean
}
function SideWindowWithRef(this: any, { isFromURL }: SideWindowProps, ref: ForwardedRef<HTMLDivElement | null>) {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const { openedSideWindowTab } = useAppSelector(state => state.global)

  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isPreloading, setIsPreloading] = useState(true)
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem<SeaFront | string>>(
    getSelectedSubMenu(openedSideWindowTab)
  )
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [isSubmenuFixed, setIsSubmenuFixed] = useState(false)

  const openedBeaconMalfunctionInKanban = useAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const { editedReportingInSideWindow } = useAppSelector(state => state.reporting)
  const { focusedPendingAlertId, pendingAlerts } = useAppSelector(state => state.alert)
  const dispatch = useAppDispatch()
  const previousOpenedSideWindowTab = usePrevious(openedSideWindowTab)

  const hasSubmenu = useMemo(
    () =>
      openedSideWindowTab !== undefined &&
      [SideWindowMenuKey.ALERTS, SideWindowMenuKey.BEACON_MALFUNCTIONS].includes(openedSideWindowTab),
    [openedSideWindowTab]
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

  const closeRightSidebar = useCallback(() => {
    dispatch(closeBeaconMalfunctionInKanban())
    dispatch(setEditedReportingInSideWindow())
  }, [dispatch])

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => wrapperRef.current)

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
      dispatch(getFishingInfractions() as any)

      dispatch(openSideWindowTab(SideWindowMenuKey.ALERTS))
      // dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))
    }
  }, [dispatch, isFromURL])

  useEffect(() => {
    if (openedSideWindowTab === previousOpenedSideWindowTab || openedSideWindowTab === SideWindowMenuKey.MISSION_LIST) {
      return
    }

    if (selectedSubMenu) {
      switch (openedSideWindowTab) {
        case SideWindowMenuKey.BEACON_MALFUNCTIONS:
          setSelectedSubMenu(BeaconMalfunctionsSubMenu.MALFUNCTIONING as unknown as MenuItem<SeaFront>)
          break

        case SideWindowMenuKey.ALERTS:
          {
            if (!focusedPendingAlertId) {
              setSelectedSubMenu(ALERTS_SUBMENU.MEMN)

              return
            }

            const focusedPendingAlert = pendingAlerts.find(propEq('id', focusedPendingAlertId))
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
    openedSideWindowTab,
    pendingAlerts,
    previousOpenedSideWindowTab,
    selectedSubMenu,
    setSelectedSubMenu
  ])

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

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return (
    <Wrapper ref={wrapperRef}>
      {!isFirstRender && (
        <NewWindowContext.Provider value={newWindowContextProviderValue}>
          <SideWindowMenu selectedMenu={openedSideWindowTab} />
          {hasSubmenu && (
            <SideWindowSubMenu
              isFixed={isSubmenuFixed}
              selectedMenu={openedSideWindowTab}
              selectedSubMenu={selectedSubMenu}
              selectedTab={selectedTab}
              setIsFixed={setIsSubmenuFixed}
              setSelectedSubMenu={setSelectedSubMenu}
            />
          )}
          <BeaconMalfunctionsBoardGrayOverlay
            onClick={closeRightSidebar}
            style={beaconMalfunctionBoardGrayOverlayStyle}
          />
          {isPreloading && (
            <Loading>
              <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.lightGray} size={100} />
              <Text data-cy="first-loader">Chargement...</Text>
            </Loading>
          )}
          {!isPreloading && (
            <Content
              height={window.innerHeight + 50}
              noMargin={
                openedSideWindowTab &&
                [SideWindowMenuKey.MISSION_FORM, SideWindowMenuKey.MISSION_LIST].includes(openedSideWindowTab)
              }
            >
              {openedSideWindowTab === SideWindowMenuKey.ALERTS && (
                <AlertsAndReportings
                  baseRef={wrapperRef as MutableRefObject<HTMLDivElement>}
                  selectedSubMenu={
                    Object.values<string>(SeaFront).includes(selectedSubMenu.code)
                      ? (selectedSubMenu as MenuItem<SeaFront>)
                      : ALERTS_SUBMENU.MEMN
                  }
                  selectedTab={selectedTab}
                  setSelectedSeaFront={setSelectedSubMenu as any}
                  setSelectedTab={setSelectedTab}
                />
              )}
              {openedSideWindowTab === SideWindowMenuKey.BEACON_MALFUNCTIONS && <BeaconMalfunctionsBoard />}
              {openedSideWindowTab === SideWindowMenuKey.MISSION_LIST && <MissionList />}
              {openedSideWindowTab === SideWindowMenuKey.MISSION_FORM && <MissionForm />}
            </Content>
          )}
        </NewWindowContext.Provider>
      )}
    </Wrapper>
  )
}

const Content = styled.div<{
  height: number
  noMargin?: boolean
}>`
  height: ${p => p.height}px;
  margin-left: ${p => (p.noMargin ? 0 : '30px')};
  min-height: 1000px;
  overflow: auto;
  width: 100%;
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

const Wrapper = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;

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

export const SideWindow = forwardRef(SideWindowWithRef)
