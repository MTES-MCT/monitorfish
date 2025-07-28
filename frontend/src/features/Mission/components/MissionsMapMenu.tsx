import { COLORS } from '@constants/constants'
import { MapBox } from '@features/Map/constants'
import { addMission } from '@features/Mission/useCases/addMission'
import { SideWindowMenuKey, SideWindowStatus } from '@features/SideWindow/constants'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { setLeftMapBoxOpened } from '../../../domain/shared_slices/Global'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'

export function MissionsMapMenu() {
  const dispatch = useMainAppDispatch()
  const sideWindow = useMainAppSelector(state => state.sideWindow)
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const isMissionsLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isMissionsLayerDisplayed)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED && sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_LIST

  const toggleMissionsWindow = () => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }

  const openNewMission = () => {
    dispatch(addMission())
  }

  const toggleMissionsMenu = () => {
    dispatch(setLeftMapBoxOpened(leftMapBoxOpened === MapBox.MISSIONS ? undefined : MapBox.MISSIONS))
  }

  const toggleMissionsLayer = () => {
    dispatch(setDisplayedComponents({ isMissionsLayerDisplayed: !isMissionsLayerDisplayed }))
  }

  return (
    <Wrapper>
      <MissionMenuBox $isLeftBox $isOpen={leftMapBoxOpened === MapBox.MISSIONS} data-cy="missions-menu-box">
        <MissionsMenuWrapper>
          <Header>
            <CloseButton Icon={Icon.Close} onClick={toggleMissionsMenu} />
            <MapMenuDialog.Title>Missions et contrôles</MapMenuDialog.Title>
            <MapMenuDialog.VisibilityButton
              accent={Accent.SECONDARY}
              data-cy="toggle-mission-layer"
              Icon={isMissionsLayerDisplayed ? Icon.Display : Icon.Hide}
              onClick={toggleMissionsLayer}
              title={isMissionsLayerDisplayed ? 'Cacher les missions' : 'Afficher les missions'}
            />
          </Header>
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
        </MissionsMenuWrapper>
      </MissionMenuBox>
      <MapToolButton
        data-cy="missions-map-button"
        Icon={Icon.MissionAction}
        iconSize={25}
        isActive={leftMapBoxOpened === MapBox.MISSIONS}
        isLeftButton
        onClick={toggleMissionsMenu}
        style={{ color: THEME.color.gainsboro, top: 136 }}
        title="Missions et contrôles"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 98;
  left: 10px;
`

const MissionMenuBox = styled(MapToolBox)`
  top: 136px;
`

const MissionsMenuWrapper = styled.div`
  width: 320px;
  background-color: ${COLORS.white};
`

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
`

const Header = styled(MapMenuDialog.Header)`
  height: 22px;
`

const MissionsMenuBody = styled.div``
const Section = styled.div`
  padding: 12px;
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.gainsboro};
  }
`

const BlockIconButton = styled(Button)`
  width: 100%;
`
