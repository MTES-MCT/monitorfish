import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { MissionForm } from '@features/Mission/components/MissionForm'
import { useListenToAllMissionEventsUpdates } from '@features/Mission/components/MissionForm/hooks/useListenToAllMissionEventsUpdates'
import { getAllCurrentReportings } from '@features/Reporting/useCases/getAllCurrentReportings'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { Notifier, THEME } from '@mtes-mct/monitor-ui'
import { isCypress } from '@utils/isCypress'
import { type CSSProperties, Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Alert } from './Alert'
import { BeaconMalfunctionBoard } from './BeaconMalfunctionBoard'
import { BannerStack } from './components/BannerStack'
import { Menu } from './Menu'
import { sideWindowActions } from './slice'
import { useIsSuperUser } from '../../auth/hooks/useIsSuperUser'
import { MissionEventContext } from '../../context/MissionEventContext'
import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'
import { closeBeaconMalfunctionInKanban } from '../../domain/shared_slices/BeaconMalfunction'
import { getOperationalAlerts } from '../../domain/use_cases/alert/getOperationalAlerts'
import { getSilencedAlerts } from '../../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getAllGearCodes from '../../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../../domain/use_cases/infraction/getInfractions'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { Loader as MissionFormLoader } from '../Mission/components/MissionForm/Loader'
import { MissionList } from '../Mission/components/MissionList'
import { PriorNotificationList } from '../PriorNotification/components/PriorNotificationList'
import { setEditedReportingInSideWindow } from '../Reporting/slice'

export function SideWindow() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  const openedBeaconMalfunctionInKanban = useMainAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const editedReportingInSideWindow = useMainAppSelector(state => state.reporting.editedReportingInSideWindow)
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)
  const missionEvent = useListenToAllMissionEventsUpdates()

  const [isOverlayed, setIsOverlayed] = useState(false)

  useEffect(() => {
    if (!isSuperUser && selectedPath.menu !== SideWindowMenuKey.PRIOR_NOTIFICATION_LIST) {
      dispatch(openSideWindowPath({ menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST }))
    }
  }, [dispatch, isSuperUser, selectedPath.menu])

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

  const closeRightSidebar = useCallback(() => {
    dispatch(closeBeaconMalfunctionInKanban())
    dispatch(setEditedReportingInSideWindow())
  }, [dispatch])

  useEffect(() => {
    if (editedReportingInSideWindow ?? openedBeaconMalfunctionInKanban) {
      setIsOverlayed(true)

      return
    }

    setIsOverlayed(false)
  }, [openedBeaconMalfunctionInKanban, editedReportingInSideWindow, selectedPath.menu])

  useEffect(() => {
    if (isCypress()) {
      dispatch(getOperationalAlerts())
      dispatch(getAllBeaconMalfunctions())
      dispatch(getSilencedAlerts())
      dispatch(getAllCurrentReportings())
      dispatch(getInfractions())
      dispatch(getAllGearCodes())
    }

    window.addEventListener('beforeunload', () => {
      dispatch(sideWindowActions.close())
    })
  }, [dispatch])

  return (
    <Wrapper>
      <BannerStack />

      {isSuperUser && <Menu selectedMenu={selectedPath.menu} />}
      {(selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD ||
        selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST) && (
        <GrayOverlay onClick={closeRightSidebar} style={grayOverlayStyle} />
      )}
      <FrontendErrorBoundary>
        <Content>
          {selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST && <Alert />}
          {selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD && <BeaconMalfunctionBoard />}
          {selectedPath.menu === SideWindowMenuKey.PRIOR_NOTIFICATION_LIST && <PriorNotificationList />}
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
      </FrontendErrorBoundary>

      <Notifier isSideWindow />
    </Wrapper>
  )
}

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
