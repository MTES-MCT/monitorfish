import { MapPropertyTrigger } from '@features/commonComponents/MapPropertyTrigger'
import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapBox } from '@features/Map/constants'
import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupMenuDialog/VesselGroupRow'
import { DEFAULT_DYNAMIC_VESSEL_GROUP } from '@features/VesselGroup/constants'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import { hideVesselsNotInVesselGroups } from '@features/VesselGroup/useCases/hideVesselsNotInVesselGroups'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Dropdown, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
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
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_GROUPS)

  const { data: vesselGroups } = useGetAllVesselGroupsQuery()
  const orderedVesselGroups = (() => {
    if (!vesselGroups?.length) {
      return []
    }

    const pinnedVesselGroups = vesselGroups.filter(vesselGroup => vesselGroupsIdsPinned.includes(vesselGroup.id))
    const unpinnedVesselGroups = vesselGroups.filter(vesselGroup => !vesselGroupsIdsPinned.includes(vesselGroup.id))

    return pinnedVesselGroups.concat(unpinnedVesselGroups)
  })()

  const createNewGroup = () => {
    dispatch(vesselGroupActions.vesselGroupEdited(DEFAULT_DYNAMIC_VESSEL_GROUP))
    dispatch(setDisplayedComponents({ isVesselGroupMainWindowEditionDisplayed: true }))
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
            data-cy="toggle-vessel-groups-layer"
            Icon={areVesselGroupsDisplayed ? Icon.Display : Icon.Hide}
            onClick={toggleVesselGroupsDisplay}
            title={areVesselGroupsDisplayed ? 'Cacher les groupes' : 'Afficher les groupes'}
          />
        </Header>
        <StyledBody>
          <VesselGroupList data-cy="vessel-groups-list">
            {orderedVesselGroups.map((vesselGroup: DynamicVesselGroup, index: number) => (
              <VesselGroupRow
                key={vesselGroup.id}
                isLastPinned={vesselGroupsIdsPinned.length === index + 1}
                vesselGroup={vesselGroup}
              />
            ))}
          </VesselGroupList>
        </StyledBody>
        <StyledFooter>
          <Buttons>
            <StyledDropdown Icon={Icon.Plus} title="Créer un nouveau groupe">
              <StyledDropdownItem
                onClick={createNewGroup}
                title="Un groupe de navires dynamique est constitué des navires répondant aux critères des filtres que vous aurez sélectionné. Il se met automatiquement à jour selon l'évolution des données des navires."
              >
                Créer un groupe dynamique <Icon.Info size={17} />
              </StyledDropdownItem>
            </StyledDropdown>
            {/**
         <BlockIconButton accent={Accent.SECONDARY} Icon={Icon.Expand} onClick={toggleMissionsWindow}>
         Voir la vue détaillée des groupes
         </BlockIconButton>
       * */}
          </Buttons>
          <MapPropertyTrigger
            booleanProperty={areVesselsNotInVesselGroupsHidden}
            Icon={areVesselsNotInVesselGroupsHidden ? Icon.Display : Icon.Hide}
            inverse
            text="les navires hors des groupes affichés"
            updateBooleanProperty={isChecked => dispatch(hideVesselsNotInVesselGroups(isChecked))}
          />
        </StyledFooter>
      </VesselGroupMenuDialogWrapper>
    )
  )
}

const StyledDropdownItem = styled(Dropdown.Item)`
  padding: 9px 10px 9px 10px;

  .Element-IconBox {
    margin-left: 9px;
  }
`

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

const StyledDropdown = styled(Dropdown)`
  width: 100%;
  margin-bottom: 8px;

  button {
    width: 100%;
  }
`
