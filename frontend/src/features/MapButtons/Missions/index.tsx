import { Accent, Button, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { MapBox } from '../../../domain/entities/map/constants'
import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { setLeftMapBoxOpened } from '../../../domain/shared_slices/Global'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { addMission } from '../../Mission/useCases/addMission'
import { openSideWindowPath } from '../../SideWindow/useCases/openSideWindowPath'
import { MapToolBox } from '../shared/MapToolBox'
import { MapToolButton } from '../shared/MapToolButton'

export function MissionsMenu() {
  const dispatch = useMainAppDispatch()
  const sideWindow = useMainAppSelector(state => state.sideWindow)
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const isMissionsLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isMissionsLayerDisplayed)

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

  const toggleMissionsMenu = () => {
    dispatch(setLeftMapBoxOpened(leftMapBoxOpened === MapBox.MISSIONS ? undefined : MapBox.MISSIONS))
  }

  const toggleMissionsLayer = () => {
    dispatch(setDisplayedComponents({ isMissionsLayerDisplayed: !isMissionsLayerDisplayed }))
  }

  return (
    <Wrapper>
      <MissionMenuBox data-cy="missions-menu-box" isLeftBox isOpen={leftMapBoxOpened === MapBox.MISSIONS}>
        <MissionsMenuWrapper>
          <MissionsMenuHeader>
            <ToggleMissionMenuButton Icon={Icon.Close} onClick={toggleMissionsMenu} size={Size.NORMAL} />
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
        </MissionsMenuWrapper>
      </MissionMenuBox>
      <MissionMenuButton
        data-cy="missions-map-button"
        isActive={leftMapBoxOpened === MapBox.MISSIONS}
        isLeftButton
        onClick={toggleMissionsMenu}
        style={{ color: THEME.color.gainsboro, top: 120 }}
        title="Missions et contrôles"
      >
        <Icon.MissionAction size={26} />
      </MissionMenuButton>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 98;
  left: 10px;
`

const MissionMenuBox = styled(MapToolBox)`
  top: 120px;
`

const MissionMenuButton = styled(MapToolButton)``

const MissionsMenuWrapper = styled.div`
  width: 320px;
  background-color: ${COLORS.white};
`

const MissionsMenuHeader = styled.div`
  height: 40px;
  background-color: ${COLORS.charcoal};
  display: flex;
  justify-content: space-between;
  padding-right: 5px;
  padding-left: 5px;
  align-items: center;
`

const Title = styled.span`
  font-size: 16px;
  line-height: 22px;
  color: ${COLORS.white};
`

const MissionsMenuBody = styled.div``
const Section = styled.div`
  padding: 12px;
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.gainsboro};
  }
`

const ToggleMissionsButton = styled(IconButton)`
  background: ${COLORS.white};

  :hover {
    background: ${COLORS.white};
  }
  :focus {
    background: ${COLORS.white};
  }
`
const ToggleMissionMenuButton = styled(IconButton)`
  color: white;
`
const BlockIconButton = styled(Button)`
  width: 100%;
`
