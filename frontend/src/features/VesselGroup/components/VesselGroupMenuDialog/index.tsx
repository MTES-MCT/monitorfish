import { MapPropertyTrigger } from '@features/commonComponents/MapPropertyTrigger'
import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapBox } from '@features/Map/constants'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupMenuDialog/VesselGroupRow'
import { hideVesselsNotInVesselGroups } from '@features/VesselGroup/useCases/hideVesselsNotInVesselGroups'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxOpened } from '../../../../domain/shared_slices/Global'

import type { DynamicVesselGroup } from '@features/VesselGroup/types'

const MARGIN_TOP = 124

export function VesselGroupMenuDialog() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const areVesselGroupsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselGroupsDisplayed)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_GROUPS)

  const { data: vesselGroups } = useGetAllVesselGroupsQuery()
  const createNewGroup = () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.VESSEL_LIST }))
  }

  const toggleVesselGroupsMenu = () => {
    dispatch(setRightMapBoxOpened(rightMapBoxOpened === MapBox.VESSEL_GROUPS ? undefined : MapBox.VESSEL_GROUPS))
  }

  const toggleVesselGroupsDisplay = () => {
    dispatch(setDisplayedComponents({ areVesselGroupsDisplayed: !areVesselGroupsDisplayed }))
  }

  return (
    isRendered && (
      <VesselGroupMenuDialogWrapper $isOpen={isOpened} data-cy="vessel-groups-menu-box">
        <Header>
          <CloseButton Icon={Icon.Close} onClick={toggleVesselGroupsMenu} />
          <MapMenuDialog.Title>Groupes de navires</MapMenuDialog.Title>
          <MapMenuDialog.VisibilityButton
            accent={Accent.SECONDARY}
            data-cy="toggle-mission-layer"
            Icon={areVesselGroupsDisplayed ? Icon.Display : Icon.Hide}
            onClick={toggleVesselGroupsDisplay}
            title={areVesselGroupsDisplayed ? 'Cacher les groupes' : 'Afficher les groupes'}
          />
        </Header>
        <StyledBody>
          <VesselGroupList>
            {vesselGroups?.map((vesselGroup: DynamicVesselGroup) => (
              <VesselGroupRow key={vesselGroup.id} vesselGroup={vesselGroup} />
            ))}
          </VesselGroupList>
        </StyledBody>
        <StyledFooter>
          <Buttons>
            <BlockIconButton accent={Accent.PRIMARY} Icon={Icon.Plus} onClick={createNewGroup}>
              Créer un nouveau groupe
            </BlockIconButton>
            {/**
         <BlockIconButton accent={Accent.SECONDARY} Icon={Icon.Expand} onClick={toggleMissionsWindow}>
         Voir la vue détaillée des groupes
         </BlockIconButton>
       * */}
          </Buttons>
          <MapPropertyTrigger
            booleanProperty={areVesselsNotInVesselGroupsHidden}
            Icon={areVesselsNotInVesselGroupsHidden ? Icon.Display : Icon.Hide}
            text="les navires hors des groupes affichés"
            updateBooleanProperty={isChecked => dispatch(hideVesselsNotInVesselGroups(isChecked))}
          />
        </StyledFooter>
      </VesselGroupMenuDialogWrapper>
    )
  )
}

const VesselGroupList = styled.ul`
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  max-height: 55vh;
  overflow-x: hidden;
  padding: 0;
  transition: 0.5s all;
`

const StyledFooter = styled(MapMenuDialog.Footer)`
  padding: 0;
  gap: 0;
  border-top: 1px ${p => p.theme.color.lightGray} solid;
`

const StyledBody = styled(MapMenuDialog.Body)`
  padding: 0;
`

const VesselGroupMenuDialogWrapper = styled(MapToolBox)`
  top: ${MARGIN_TOP}px;
  width: 400px;
`

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
`

const Header = styled(MapMenuDialog.Header)`
  height: 22px;
`

const Buttons = styled.div`
  padding: 16px 16px 8px 16px;
  gap: 8px;
`

const BlockIconButton = styled(Button)`
  width: 100%;
  margin-bottom: 8px;
`
