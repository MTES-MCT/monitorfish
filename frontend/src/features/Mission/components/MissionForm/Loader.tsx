import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { assert } from '@utils/assert'
import { SideWindowMenuKey } from 'domain/entities/sideWindow/constants'
import { retry } from 'domain/use_cases/error/retry'
import { useCallback } from 'react'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { BackToListIcon, Body, CloseButton, Footer, Header, HeaderTitle, Wrapper } from '.'
import { AutoSaveTag } from './shared/AutoSaveTag'

export function Loader() {
  const dispatch = useMainAppDispatch()
  const missionIdFromPath = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const missionFormError = useMainAppSelector(state => state.displayedError.missionFormError)

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleRetry = () => {
    assert(missionFormError, 'missionFormError')

    dispatch(retry('missionFormError', missionFormError.useCase))
  }

  if (missionFormError) {
    return (
      <ErrorFallback data-cy="mission-form-error">
        🔌 {missionFormError.message}
        <br />
        {missionFormError.useCase && (
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
        <div>
          {!!missionIdFromPath && (
            <Button accent={Accent.SECONDARY} disabled Icon={Icon.Delete}>
              Supprimer la mission
            </Button>
          )}
        </div>
        <div>
          <AutoSaveTag />
          <CloseButton accent={Accent.PRIMARY} disabled onClick={goToMissionList}>
            Fermer
          </CloseButton>
        </div>
      </Footer>
    </Wrapper>
  )
}

const ErrorFallback = styled.div`
  width: 250px;
  height: 90px;
  color: ${p => p.theme.color.slateGray};
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
