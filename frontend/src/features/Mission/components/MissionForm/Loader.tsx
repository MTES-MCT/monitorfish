import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedError } from '@libs/DisplayedError'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { BackToListIcon, Body, Footer, Header, HeaderTitle, RightButtonsContainer, Wrapper } from '.'
import { AutoSaveTag } from './shared/AutoSaveTag'

export function Loader() {
  const dispatch = useMainAppDispatch()
  const missionFormError = useMainAppSelector(state => state.displayedError.missionFormError)

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleRetry = () => {
    DisplayedError.retryUseCase(dispatch, DisplayedErrorKey.MISSION_FORM_ERROR)
  }

  if (missionFormError) {
    return (
      <ErrorFallback data-cy="mission-form-error">
        🔌 {missionFormError.message}
        <br />
        {missionFormError.hasRetryableUseCase && (
          <RetryButton accent={Accent.PRIMARY} onClick={handleRetry}>
            Réessayer
          </RetryButton>
        )}
      </ErrorFallback>
    )
  }

  return (
    <Wrapper>
      <Header>
        <BackToListIcon onClick={goToMissionList} />

        <HeaderTitle>Mission en cours de chargement...</HeaderTitle>
      </Header>

      <Body>
        <LoadingSpinnerWall />
      </Body>

      <Footer>
        <Button accent={Accent.SECONDARY} disabled Icon={Icon.Delete}>
          Supprimer la mission
        </Button>

        <RightButtonsContainer>
          <AutoSaveTag />
          <Button accent={Accent.PRIMARY} disabled onClick={goToMissionList}>
            Fermer
          </Button>
        </RightButtonsContainer>
      </Footer>
    </Wrapper>
  )
}

const ErrorFallback = styled.div`
  width: 250px;
  height: 90px;
  color: #FF3392;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  margin: 0 auto;
  transform: translateY(-50%);
  text-align: center;
`

const RetryButton = styled(Button)`
  margin-top: 10px;
`
