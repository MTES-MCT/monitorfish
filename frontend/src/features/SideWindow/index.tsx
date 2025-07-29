import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { getOperationalAlerts } from '@features/Alert/useCases/getOperationalAlerts'
import { getSilencedAlerts } from '@features/Alert/useCases/getSilencedAlerts'
import { MissionForm } from '@features/Mission/components/MissionForm'
import { useListenToAllMissionEventsUpdates } from '@features/Mission/components/MissionForm/hooks/useListenToAllMissionEventsUpdates'
import { reportingApi } from '@features/Reporting/reportingApi'
import { reportingActions } from '@features/Reporting/slice'
import { SIDE_WINDOW_EXTERNAL_USER_PATH, SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { VesselListAndGroups } from '@features/Vessel/components/VesselListAndGroups'
import { setVessels } from '@features/Vessel/slice'
import { vesselApi } from '@features/Vessel/vesselApi'
import {
  FulfillingBouncingCircleLoader,
  NewWindowContext,
  type NewWindowContextValue,
  Notifier,
  THEME
} from '@mtes-mct/monitor-ui'
import {
  type CSSProperties,
  Fragment,
  type HTMLAttributes,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import styled, { createGlobalStyle, css, StyleSheetManager } from 'styled-components'

import { BannerStack } from './components/BannerStack'
import { Menu } from './Menu'
import { useIsSuperUser } from '../../auth/hooks/useIsSuperUser'
import { MissionEventContext } from '../../context/MissionEventContext'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { getAllGearCodes } from '../../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../../domain/use_cases/infraction/getInfractions'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { SideWindowAlerts } from '../Alert/components/SideWindowAlerts'
import { BeaconMalfunctionBoard } from '../BeaconMalfunction/components/BeaconMalfunctionBoard'
import { getAllBeaconMalfunctions } from '../BeaconMalfunction/useCases/getAllBeaconMalfunctions'
import { Loader as MissionFormLoader } from '../Mission/components/MissionForm/Loader'
import { MissionList } from '../Mission/components/MissionList'
import { PriorNotificationList } from '../PriorNotification/components/PriorNotificationList'

import type { MainAppAsyncThunk } from '@store'

export type SideWindowProps = HTMLAttributes<HTMLDivElement> & {
  isFromURL: boolean
}
export function SideWindow({ isFromURL }: SideWindowProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const openedBeaconMalfunctionInKanban = useMainAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)
  const missionEvent = useListenToAllMissionEventsUpdates()

  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isOverlayed, setIsOverlayed] = useState(false)
  const [isPreloading, setIsPreloading] = useState(true)

  useEffect(() => {
    if (!isSuperUser && !SIDE_WINDOW_EXTERNAL_USER_PATH.includes(selectedPath?.menu)) {
      dispatch(openSideWindowPath({ menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST }))
    }
  }, [dispatch, isSuperUser, selectedPath?.menu])

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
    dispatch(reportingActions.unsetEditedReporting())
  }, [dispatch])

  useEffect(() => {
    setTimeout(() => {
      setIsPreloading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (editedReporting ?? openedBeaconMalfunctionInKanban) {
      setIsOverlayed(true)

      return
    }

    setIsOverlayed(false)
  }, [openedBeaconMalfunctionInKanban, editedReporting, selectedPath.menu])

  useEffect(() => {
    ;(async function () {
      if (!isFromURL) {
        return
      }

      if (isSuperUser) {
        dispatch(getOperationalAlerts())
        dispatch(getAllBeaconMalfunctions())
        dispatch(getSilencedAlerts())
        dispatch(reportingApi.endpoints.getReportings.initiate())
      }

      const vessels = await dispatch(vesselApi.endpoints.getActiveVessels.initiate()).unwrap()
      await dispatch(setVessels(vessels))
      dispatch(getInfractions())
      dispatch(getAllGearCodes<MainAppAsyncThunk>())
    })()
  }, [dispatch, isFromURL, isSuperUser])

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return (
    <StyleSheetManager target={wrapperRef.current ?? undefined}>
      <Wrapper ref={wrapperRef}>
        {!isFirstRender && (
          <NewWindowContext.Provider value={newWindowContextProviderValue}>
            <GlobalStyle $isFromURL={isFromURL} />

            <BannerStack />

            <Menu selectedMenu={selectedPath.menu} />
            {(selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD ||
              selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST) && (
              <GrayOverlay onClick={closeRightSidebar} style={grayOverlayStyle} />
            )}
            <FrontendErrorBoundary>
              {isPreloading && (
                <Loading>
                  <FulfillingBouncingCircleLoader className="update-vessels" color={THEME.color.lightGray} />
                  <Text data-cy="first-loader">Chargement...</Text>
                </Loading>
              )}
              {!isPreloading && (
                <Content>
                  {(selectedPath.menu === SideWindowMenuKey.VESSEL_LIST ||
                    selectedPath.menu === SideWindowMenuKey.VESSEL_GROUP) && (
                    <VesselListAndGroups isFromUrl={isFromURL} />
                  )}
                  {selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST && (
                    <SideWindowAlerts baseRef={wrapperRef as MutableRefObject<HTMLDivElement>} isFromUrl={isFromURL} />
                  )}
                  {selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD && <BeaconMalfunctionBoard />}
                  {selectedPath.menu === SideWindowMenuKey.PRIOR_NOTIFICATION_LIST && (
                    <PriorNotificationList isFromUrl={isFromURL} />
                  )}
                  {selectedPath.menu === SideWindowMenuKey.MISSION_LIST && <MissionList />}

                  {selectedPath.menu === SideWindowMenuKey.MISSION_FORM && (
                    <>
                      {selectedPath.isLoading ? (
                        <MissionFormLoader />
                      ) : (
                        <Fragment key={selectedPath.id ?? selectedPath.key}>
                          <MissionEventContext.Provider value={missionEvent}>
                            <MissionForm />
                          </MissionEventContext.Provider>
                        </Fragment>
                      )}
                    </>
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

const GlobalStyle = createGlobalStyle<{
  $isFromURL: boolean
}>`
  html, body, #root {
    height: 100%;
  }

  /*
    Hack to fix the strange checkbox vertical position inconsistency
    between the side window access via /side_window and the one opened as a new window.
    The position is correct when accessed via /side_window (and not when opened as a new window).
  */
  ${p =>
    !p.$isFromURL &&
    css`
      .rs-checkbox {
        > .rs-checkbox-checker {
          > label {
            line-height: inherit;
          }
        }
      }
      .Table-SimpleTable {
        > thead {
          > tr {
            > th:first-child {
              > .rs-checkbox {
                > .rs-checkbox-checker {
                  > label {
                    .rs-checkbox-control {
                      top: -8px;
                    }
                  }
                }
              }
            }
          }
        }
        > tbody {
          > tr {
            > td {
              > .Element-Tag {
                vertical-align: middle;
              }
            }
            > td:first-child {
              > .rs-checkbox {
                > .rs-checkbox-checker {
                  > label {
                    .rs-checkbox-control {
                      top: -13px;
                      left: 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    `}
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
