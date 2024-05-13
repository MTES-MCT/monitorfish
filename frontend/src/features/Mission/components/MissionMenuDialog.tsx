import { addMission } from '@features/Mission/useCases/addMission'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useCallback } from 'react'
import styled from 'styled-components'

import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { mainWindowActions } from '../../MainWindow/slice'

export function MissionMenuDialog() {
  const dispatch = useMainAppDispatch()
  const sideWindow = useMainAppSelector(state => state.sideWindow)
  const isMissionsLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isMissionsLayerDisplayed)
  const openedLeftDialog = useMainAppSelector(state => state.mainWindow.openedLeftDialog)
  assertNotNullish(openedLeftDialog)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED && sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_LIST

  const toggleMissionsWindow = useCallback(() => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch, isActive])

  const openNewMission = () => {
    dispatch(addMission())
  }

  const close = () => {
    dispatch(mainWindowActions.closeLeftDialog())
  }

  const toggleMissionsLayer = () => {
    dispatch(setDisplayedComponents({ isMissionsLayerDisplayed: !isMissionsLayerDisplayed }))
  }

  return (
    <Wrapper data-cy="missions-menu-box" style={{ top: openedLeftDialog.topPosition }}>
      <MissionsMenuHeader>
        <ToggleMissionMenuButton Icon={Icon.Close} onClick={close} size={Size.NORMAL} />
        <Title>Missions et contrôles</Title>
        <ToggleMissionsButton
          accent={Accent.TERTIARY}
          data-cy="toggle-mission-layer"
          Icon={isMissionsLayerDisplayed ? Icon.Display : Icon.Hide}
          onClick={toggleMissionsLayer}
          size={Size.NORMAL}
          title={isMissionsLayerDisplayed ? 'Cacher les missions' : 'Afficher les missions'}
        />
      </MissionsMenuHeader>
      <MissionsMenuBody>
        <Section>
          <BlockIconButton accent={Accent.PRIMARY} Icon={Icon.Plus} onClick={openNewMission}>
            Ouvrir une nouvelle mission
          </BlockIconButton>
        </Section>
        <Section>
          <BlockIconButton accent={Accent.SECONDARY} Icon={Icon.Expand} onClick={toggleMissionsWindow}>
            Voir la vue détaillée des missions
          </BlockIconButton>
        </Section>
      </MissionsMenuBody>
    </Wrapper>
  )
}

// TODO Check with Adeline if we plan on keeping the animation (disabled for now).
const Wrapper = styled.div`
  box-sizing: border-box;
  background-color: ${p => p.theme.color.white};
  left: 64px;
  position: absolute;
  transition: all 0.5s;
  width: 320px;

  * {
    box-sizing: border-box;
  }
`

const MissionsMenuHeader = styled.div`
  height: 40px;
  background-color: ${p => p.theme.color.charcoal};
  display: flex;
  justify-content: space-between;
  padding-right: 5px;
  padding-left: 5px;
  align-items: center;
`

const Title = styled.span`
  font-size: 16px;
  line-height: 22px;
  color: ${p => p.theme.color.white};
`

const MissionsMenuBody = styled.div``
const Section = styled.div`
  padding: 12px;
  &:not(:last-child) {
    border-bottom: 1px solid ${p => p.theme.color.gainsboro};
  }
`

const ToggleMissionsButton = styled(IconButton)`
  background: ${p => p.theme.color.white};

  :hover {
    background: ${p => p.theme.color.white};
  }
  :focus {
    background: ${p => p.theme.color.white};
  }
`
const ToggleMissionMenuButton = styled(IconButton)`
  color: white;
`
const BlockIconButton = styled(Button)`
  width: 100%;
`
