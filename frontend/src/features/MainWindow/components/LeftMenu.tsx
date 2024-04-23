import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { MapBox } from 'domain/entities/map/constants'
import { SideWindowMenuKey, SideWindowStatus } from 'domain/entities/sideWindow/constants'
import { sideWindowActions } from 'domain/shared_slices/SideWindow'
import { useRef } from 'react'
import styled from 'styled-components'

import { mainWindowActions } from '../slice'

export function LeftMenu() {
  const missionButtonRef = useRef<HTMLDivElement | null>(null)

  const dispatch = useMainAppDispatch()
  const { favorites } = useMainAppSelector(state => state.favoriteVessel)
  const leftDialog = useMainAppSelector(state => state.mainWindow.leftDialog)
  const isAlertsMapButtonDisplayed = useMainAppSelector(state => state.displayedComponent.isAlertsMapButtonDisplayed)
  const isBeaconMalfunctionsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isBeaconMalfunctionsMapButtonDisplayed
  )
  const isFavoriteVesselsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isFavoriteVesselsMapButtonDisplayed
  )
  const isMissionsMapButtonDisplayed = useMainAppSelector(
    state => state.displayedComponent.isMissionsMapButtonDisplayed
  )
  const isSuperUser = useIsSuperUser()
  // const previewFilteredVesselsMode = useMainAppSelector(state => state.mainWindow.previewFilteredVesselsMode)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const toggleMissionMenuDialog = () => {
    assertNotNullish(missionButtonRef.current)

    dispatch(
      mainWindowActions.toggleLeftDialog({
        key: MapBox.MISSIONS,
        topPosition: missionButtonRef.current.getBoundingClientRect().top
      })
    )
  }

  const toggleSideWindowAlertList = () => {
    const isActive =
      sideWindow.status !== SideWindowStatus.CLOSED &&
      sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
  }

  return (
    <Wrapper>
      <Block>
        <IconButton Icon={Icon.MapLayers} size={Size.LARGE} />
      </Block>

      {isFavoriteVesselsMapButtonDisplayed && (
        <Block>
          <IconButtonWrapper>
            <IconButtonBadge $isActive={leftDialog?.key === 'FAVORITE_VESSELS'}>
              {favorites?.length || 0}
            </IconButtonBadge>
            <IconButton Icon={Icon.Favorite} size={Size.LARGE} />
          </IconButtonWrapper>
        </Block>
      )}

      <Block>
        {isSuperUser && isMissionsMapButtonDisplayed && (
          <IconButtonWrapper ref={missionButtonRef}>
            <IconButton
              data-cy="missions-map-button"
              data-isActive={leftDialog?.key === MapBox.MISSIONS}
              Icon={Icon.MissionAction}
              onClick={toggleMissionMenuDialog}
              size={Size.LARGE}
              title="Missions et contrôles"
            />
          </IconButtonWrapper>
        )}

        {isSuperUser && isAlertsMapButtonDisplayed && (
          <IconButton
            data-cy="alerts-button"
            data-isActive={
              sideWindow.status !== SideWindowStatus.CLOSED &&
              sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST
            }
            Icon={Icon.Alert}
            onClick={toggleSideWindowAlertList}
            size={Size.LARGE}
            title="Alertes"
          />
        )}

        {import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true' && (
          <IconButton Icon={Icon.Fishery} size={Size.LARGE} />
        )}

        {isSuperUser && isBeaconMalfunctionsMapButtonDisplayed && <IconButton Icon={Icon.Vms} size={Size.LARGE} />}
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
const IconButtonBadge = styled.div<{
  $isActive: boolean
}>`
  background-color: ${p => (p.$isActive ? p.theme.color.charcoal : p.theme.color.gainsboro)};
  border-radius: 50%;
  color: ${p => (p.$isActive ? p.theme.color.white : p.theme.color.gunMetal)};
  height: 16px;
  left: 40px;
  line-height: 16px;
  position: absolute;
  top: -6px;
  width: 16px;
  z-index: 100;
`
