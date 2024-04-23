import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { useContext } from 'react'
import styled from 'styled-components'

import { UserAccountContext } from '../../../context/UserAccountContext'
import { MapBox } from '../../../domain/entities/map/constants'
import { setRightMapBoxOpened } from '../../MainWindow/slice'

const MARGIN_TOP = 390

export function Account() {
  const dispatch = useMainAppDispatch()
  const userAccount = useContext(UserAccountContext)
  const rightMapBoxOpened = useMainAppSelector(state => state.mainWindow.rightMapBoxOpened)
  const rightMenuIsOpen = useMainAppSelector(state => state.mainWindow.rightMenuIsOpen)

  const openOrClose = () => {
    dispatch(setRightMapBoxOpened(rightMapBoxOpened === MapBox.ACCOUNT ? undefined : MapBox.ACCOUNT))
  }

  return (
    <Wrapper>
      <MissionMenuBox data-cy="map-account-box" isOpen={rightMapBoxOpened === MapBox.ACCOUNT}>
        <StyledContainer>
          <MapMenuDialog.Header>
            <MapMenuDialog.Title>Déconnexion</MapMenuDialog.Title>
          </MapMenuDialog.Header>
          <MapMenuDialog.Body>{userAccount.email ?? 'Vous n’êtes pas connecté avec Cerbère'}</MapMenuDialog.Body>
          {userAccount.email && (
            <MapMenuDialog.Footer>
              <Button accent={Accent.SECONDARY} Icon={Icon.Logout} isFullWidth onClick={userAccount.logout}>
                Se déconnecter
              </Button>
            </MapMenuDialog.Footer>
          )}
        </StyledContainer>
      </MissionMenuBox>
      <MapToolButton
        isActive={rightMapBoxOpened === MapBox.ACCOUNT}
        onClick={openOrClose}
        style={{ color: THEME.color.gainsboro, cursor: 'pointer', top: MARGIN_TOP, zIndex: 99999 }}
        title="Mon compte"
      >
        <Icon.Account color={rightMenuIsOpen ? THEME.color.gainsboro : THEME.color.charcoal} size={20} />
      </MapToolButton>
    </Wrapper>
  )
}

const StyledContainer = styled(MapMenuDialog.Container)`
  margin-right: unset;
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 98;
  left: 10px;

  * {
    box-sizing: border-box;
  }
`

const MissionMenuBox = styled(MapToolBox)`
  top: ${MARGIN_TOP}px;
`
