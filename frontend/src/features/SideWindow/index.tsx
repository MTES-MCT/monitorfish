import { THEME, type NewWindowContextValue, NewWindowContext, Notifier } from '@mtes-mct/monitor-ui'
import {
  type CSSProperties,
  type HTMLAttributes,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment
} from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled, { createGlobalStyle, StyleSheetManager } from 'styled-components'

import { Alert } from './Alert'
import { BeaconMalfunctionBoard } from './BeaconMalfunctionBoard'
import { Menu } from './Menu'
import { MissionForm } from './MissionForm'
import { useListenToAllMissionEventsUpdates } from './MissionForm/hooks/useListenToAllMissionEventsUpdates'
import { MissionList } from './MissionList'
import { MissionEventContext } from '../../context/MissionEventContext'
import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { getOperationalAlerts } from '../../domain/use_cases/alert/getOperationalAlerts'
import { getSilencedAlerts } from '../../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getAllGearCodes from '../../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../../domain/use_cases/infraction/getInfractions'
import { sideWindowDispatchers } from '../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { FrontendErrorBoundary } from '../../ui/FrontendErrorBoundary'
import { setEditedReportingInSideWindow } from '../Reporting/slice'
import { getAllCurrentReportings } from '../Reporting/useCases/getAllCurrentReportings'

export type SideWindowProps = HTMLAttributes<HTMLDivElement> & {
  isFromURL: boolean
}
export function SideWindow({ isFromURL }: SideWindowProps) {
  const dispatch = useMainAppDispatch()
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const openedBeaconMalfunctionInKanban = useMainAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const editedReportingInSideWindow = useMainAppSelector(state => state.reporting.editedReportingInSideWindow)
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)
  const missionEvent = useListenToAllMissionEventsUpdates()

  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [isPreloading, setIsPreloading] = useState(true)

  const grayOverlayStyle: CSSProperties = useMemo(
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
  }, [openedBeaconMalfunctionInKanban, editedReportingInSideWindow, selectedPath.menu])

  useEffect(() => {
    if (isFromURL) {
      dispatch(getOperationalAlerts())
      dispatch(getAllBeaconMalfunctions())
      dispatch(getSilencedAlerts())
      dispatch(getAllCurrentReportings())
      dispatch(getInfractions())
      dispatch(getAllGearCodes())

      dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
    }
  }, [dispatch, isFromURL])

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return (
    <StyleSheetManager target={wrapperRef.current || undefined}>
      <Wrapper ref={wrapperRef}>
        {!isFirstRender && (
          <NewWindowContext.Provider value={newWindowContextProviderValue}>
            <GlobalStyle />

            <Menu selectedMenu={selectedPath.menu} />
            {(selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD ||
              selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST) && (
              <GrayOverlay onClick={closeRightSidebar} style={grayOverlayStyle} />
            )}
            <FrontendErrorBoundary>
              {isPreloading && (
                <Loading>
                  <FulfillingBouncingCircleSpinner
                    className="update-vessels"
                    color={THEME.color.lightGray}
                    size={100}
                  />
                  <Text data-cy="first-loader">Chargement...</Text>
                </Loading>
              )}
              {!isPreloading && (
                <Content>
                  {selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST && (
                    <Alert baseRef={wrapperRef as MutableRefObject<HTMLDivElement>} />
                  )}
                  {selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD && <BeaconMalfunctionBoard />}
                  {selectedPath.menu === SideWindowMenuKey.MISSION_LIST && <MissionList />}

                  {selectedPath.menu === SideWindowMenuKey.MISSION_FORM && (
                    <Fragment key={selectedPath.id}>
                      <MissionEventContext.Provider value={missionEvent}>
                        <MissionForm />
                      </MissionEventContext.Provider>
                    </Fragment>
                  )}
                </Content>
              )}
            </FrontendErrorBoundary>
            <Notifier isSideWindow />
          </NewWindowContext.Provider>
        )}
      </Wrapper>
    </StyleSheetManager>
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

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  min-height: 0;
  min-width: 0;
`

const GrayOverlay = styled.div``

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
