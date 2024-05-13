import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Figure, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { MapBox } from 'domain/entities/map/constants'
import { SideWindowMenuKey, SideWindowStatus } from 'domain/entities/sideWindow/constants'
import { sideWindowActions } from 'domain/shared_slices/SideWindow'
import { useRef } from 'react'
import styled from 'styled-components'

import { mainWindowActions } from '../slice'

export function LeftMenu() {
  const favoriteVesselsButtonRef = useRef<HTMLDivElement | null>(null)
  const missionsButtonRef = useRef<HTMLDivElement | null>(null)
  const regulationsButtonRef = useRef<HTMLDivElement | null>(null)

  const dispatch = useMainAppDispatch()
  const favorites = useMainAppSelector(state => state.favoriteVessel.favorites)
  const isSuperUser = useIsSuperUser()
  const openedLeftDialog = useMainAppSelector(state => state.mainWindow.openedLeftDialog)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const isAlertsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isAlertsLeftMenuButtonDisplayed
  )
  const isBeaconMalfunctionsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isBeaconMalfunctionsLeftMenuButtonDisplayed
  )
  const isFavoriteVesselsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isFavoriteVesselsLeftMenuButtonDisplayed
  )
  const isMissionsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isMissionsLeftMenuButtonDisplayed
  )
  const isPriorNotificationLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isPriorNotificationLeftMenuButtonDisplayed
  )
  const isRegulationsLeftMenuButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isRegulationsLeftMenuButtonDisplayed
  )

  const isSideWindowAlertsActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
  const isSideWindowMissionsActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    (sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_LIST ||
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM)
  const isSideWindowPriorNotificationsActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.PRIOR_NOTIFICATION_LIST
  const isSideWindowBeaconMalfunctionsActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD

  const toggleFavoriteVesselListDialog = () => {
    assertNotNullish(favoriteVesselsButtonRef.current)

    dispatch(
      mainWindowActions.toggleLeftDialog({
        key: MapBox.FAVORITE_VESSELS,
        topPosition: favoriteVesselsButtonRef.current.getBoundingClientRect().top
      })
    )
  }

  const toggleMissionMenuDialog = () => {
    assertNotNullish(missionsButtonRef.current)

    dispatch(
      mainWindowActions.toggleLeftDialog({
        key: MapBox.MISSIONS,
        topPosition: missionsButtonRef.current.getBoundingClientRect().top
      })
    )
  }

  const toggleRegulationDialog = () => {
    assertNotNullish(regulationsButtonRef.current)

    dispatch(
      mainWindowActions.toggleLeftDialog({
        key: MapBox.REGULATIONS,
        topPosition: regulationsButtonRef.current.getBoundingClientRect().top
      })
    )
  }

  const toggleSideWindowAlertList = () => {
    if (isSideWindowAlertsActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
  }

  const toggleSideWindowPriorNotificationList = () => {
    if (isSideWindowPriorNotificationsActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST }))
  }

  return (
    <Wrapper>
      {isRegulationsLeftMenuButtonDisplayed && (
        <Block>
          <IconButtonWrapper ref={regulationsButtonRef}>
            <IconButton
              className={openedLeftDialog?.key === MapBox.REGULATIONS ? '_active' : undefined}
              data-cy="layers-sidebar"
              Icon={Icon.MapLayers}
              onClick={toggleRegulationDialog}
              size={Size.LARGE}
              title="Couches réglementaires"
            />
          </IconButtonWrapper>
        </Block>
      )}

      {isFavoriteVesselsLeftMenuButtonDisplayed && (
        <Block>
          <IconButtonWrapper ref={favoriteVesselsButtonRef}>
            <IconButtonBadge $isActive={openedLeftDialog?.key === 'FAVORITE_VESSELS'} data-cy="favorite-vessels-number">
              {favorites?.length || 0}
            </IconButtonBadge>
            <IconButton
              className={openedLeftDialog?.key === MapBox.FAVORITE_VESSELS ? '_active' : undefined}
              data-cy="favorite-vessels"
              Icon={Icon.Favorite}
              onClick={toggleFavoriteVesselListDialog}
              size={Size.LARGE}
              title="Mes navires suivis"
            />
          </IconButtonWrapper>
        </Block>
      )}

      <Block>
        {isSuperUser && isMissionsLeftMenuButtonDisplayed && (
          <IconButtonWrapper ref={missionsButtonRef}>
            <IconButton
              className={
                openedLeftDialog?.key === MapBox.MISSIONS || isSideWindowMissionsActive ? '_active' : undefined
              }
              data-cy="missions-map-button"
              Icon={Icon.MissionAction}
              onClick={toggleMissionMenuDialog}
              size={Size.LARGE}
              title="Missions et contrôles"
            />
          </IconButtonWrapper>
        )}

        {isSuperUser && isAlertsLeftMenuButtonDisplayed && (
          <IconButton
            className={isSideWindowAlertsActive ? '_active' : undefined}
            data-cy="alerts-button"
            Icon={Icon.Alert}
            onClick={toggleSideWindowAlertList}
            size={Size.LARGE}
            title="Alertes"
          />
        )}

        {import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true' &&
          isPriorNotificationLeftMenuButtonDisplayed && (
            <IconButton
              className={isSideWindowPriorNotificationsActive ? '_active' : undefined}
              Icon={Icon.Fishery}
              onClick={toggleSideWindowPriorNotificationList}
              size={Size.LARGE}
            />
          )}

        {isSuperUser && isBeaconMalfunctionsLeftMenuButtonDisplayed && (
          <IconButton
            className={isSideWindowBeaconMalfunctionsActive ? '_active' : undefined}
            data-cy="beacon-malfunction-button"
            Icon={Icon.Vms}
            size={Size.LARGE}
            title="Avaries VMS"
          />
        )}
      </Block>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 112px;
  top: 12px;

  * {
    box-sizing: border-box;
  }

  > div:not(:first-child) {
    margin-top: 16px;
  }
`

const Block = styled.div`
  display: flex;
  flex-direction: column;

  > *:not(:first-child) {
    margin-top: 4px;
  }
`

const IconButtonWrapper = styled.div`
  position: relative;
`
const IconButtonBadge = styled(Figure)<{
  $isActive: boolean
}>`
  align-items: center;
  background-color: ${p => (p.$isActive ? p.theme.color.charcoal : p.theme.color.gainsboro)};
  border-radius: 50%;
  color: ${p => (p.$isActive ? p.theme.color.white : p.theme.color.gunMetal)};
  display: flex;
  height: 16px;
  justify-content: center;
  left: 38px;
  line-height: 16px;
  position: absolute;
  top: -6px;
  width: 16px;
  z-index: 100;
`
