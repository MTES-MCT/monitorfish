import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { useContext } from 'react'
import styled from 'styled-components'

import { UserAccountContext } from '../../../context/UserAccountContext'
import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'

const MARGIN_TOP = 428

export function Account() {
  const dispatch = useMainAppDispatch()
  const userAccount = useContext(UserAccountContext)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.ACCOUNT)

  const openOrClose = () => {
    dispatch(setRightMapBoxOpened(rightMapBoxOpened === MapBox.ACCOUNT ? undefined : MapBox.ACCOUNT))
  }

  return (
    <Wrapper>
      {isRendered && (
        <MapMenuDialogWrapper $hideBoxShadow $isOpen={isOpened} data-cy="map-account-box">
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
        </MapMenuDialogWrapper>
      )}
      <MapToolButton
        Icon={Icon.Account}
        isActive={isOpened}
        onClick={openOrClose}
        style={{ top: MARGIN_TOP }}
        title="Mon compte"
      />
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

const MapMenuDialogWrapper = styled(MapToolBox)`
  top: ${MARGIN_TOP}px;
`
