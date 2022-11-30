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
import { theme } from '../../ui/theme'
import { AlertsAndReportings } from './alerts_reportings/AlertsAndReportings'
import { BeaconMalfunctionsSubMenu } from './beacon_malfunctions/beaconMalfunctions'
import { BeaconMalfunctionsBoard } from './beacon_malfunctions/BeaconMalfunctionsBoard'
import { AlertAndReportingTab, SideWindowMenuKey } from './constants'
import { MissionForm } from './MissionForm'
import { MissionList } from './MissionList'
import { SideWindowMenu } from './SideWindowMenu'
import { SideWindowSubMenu } from './SideWindowSubMenu'
import { getSelectedSubMenu } from './utils'

import type { MenuItem } from '../../types'
import type { CSSProperties, ForwardedRef } from 'react'

export type SideWindowProps = {
  isFromURL: boolean
}
function SideWindowWithRef({ isFromURL }: SideWindowProps, ref: ForwardedRef<HTMLDivElement>) {
  const { openedSideWindowTab } = useAppSelector(state => state.global)
  const openedBeaconMalfunctionInKanban = useAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const { editedReportingInSideWindow } = useAppSelector(state => state.reporting)
  const { focusedPendingAlertId, pendingAlerts } = useAppSelector(state => state.alert)
  const dispatch = useAppDispatch()
  const [isPreloading, setIsPreloading] = useState(true)
  const previousOpenedSideWindowTab = usePrevious(openedSideWindowTab)
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem<SeaFront | string>>(
    getSelectedSubMenu(openedSideWindowTab)
  )
  const [selectedTab, setSelectedTab] = useState(AlertAndReportingTab.ALERT)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [isSubmenuFixed, setIsSubmenuFixed] = useState(false)

  const hasSubmenu = useMemo(
    () =>
      openedSideWindowTab !== undefined &&
      [SideWindowMenuKey.ALERTS, SideWindowMenuKey.BEACON_MALFUNCTIONS].includes(openedSideWindowTab),
    [openedSideWindowTab]
  )

  const closeRightSidebar = useCallback(() => {
    dispatch(closeBeaconMalfunctionInKanban())
    dispatch(setEditedReportingInSideWindow())
  }, [dispatch])

  const baseRef = useRef() as MutableRefObject<HTMLDivElement>
  useImperativeHandle(ref, () => baseRef.current)

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

      dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))
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
      background: theme.color.charcoal,
      height: '100%',
      opacity: isOverlayed ? 0.5 : 0,
      position: 'absolute',
      width: '100%',
      zIndex: isOverlayed ? 11 : -9999
    }),
    [isOverlayed]
  )

  return (
    <Wrapper ref={baseRef}>
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
      <BeaconMalfunctionsBoardGrayOverlay onClick={closeRightSidebar} style={beaconMalfunctionBoardGrayOverlayStyle} />
      {isPreloading && (
        <Loading>
          <FulfillingBouncingCircleSpinner className="update-vessels" color={theme.color.lightGray} size={100} />
          <Text data-cy="first-loader">Chargement...</Text>
        </Loading>
      )}
      {!isPreloading && (
        <Content height={window.innerHeight + 50} noMargin={openedSideWindowTab === SideWindowMenuKey.MISSION_FORM}>
          {openedSideWindowTab === SideWindowMenuKey.ALERTS && (
            <AlertsAndReportings
              baseRef={baseRef}
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
  margin-top: 350px;
  margin-left: 550px;
`

const Text = styled.span`
  margin-top: 10px;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  bottom: -17px;
  position: relative;
`

const Wrapper = styled.div`
  display: flex;
  background: ${p => p.theme.color.white};

  @keyframes blink {
    0% {
      background: ${p => p.theme.color.white};
    }
    50% {
      background: ${p => p.theme.color.lightGray};
    }
    0% {
      background: ${p => p.theme.color.white};
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
