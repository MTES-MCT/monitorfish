import { MapPropertyTrigger } from '@features/commonComponents/MapPropertyTrigger'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapBox } from '@features/Map/constants'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { useGetVesselGroups } from '@features/VesselGroup/components/VesselGroupMenuDialog/hooks/useGetVesselGroups'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupMenuDialog/VesselGroupRow'
import { DEFAULT_DYNAMIC_VESSEL_GROUP, DEFAULT_FIXED_VESSEL_GROUP } from '@features/VesselGroup/constants'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import { GroupType, Sharing, type VesselGroup } from '@features/VesselGroup/types'
import { hideVesselsNotInVesselGroups } from '@features/VesselGroup/useCases/hideVesselsNotInVesselGroups'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Dropdown, Icon, MapMenuDialog, Select } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../../domain/use_cases/setRightMapBoxDisplayed'

const GROUP_TYPE_OPTIONS = [
  { label: 'Groupes dynamiques', value: GroupType.DYNAMIC },
  { label: 'Groupes fixes', value: GroupType.FIXED }
]

const SHARING_OPTIONS = [
  { label: 'Groupes partagés', value: Sharing.SHARED },
  { label: 'Groupes personnels', value: Sharing.PRIVATE }
]

export function VesselGroupMenuDialog() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_GROUPS)

  const { filteredGroupType, filteredSharing } = useMainAppSelector(state => state.vesselGroup)

  const { pinnedVesselGroups, unpinnedVesselGroups } = useGetVesselGroups(filteredGroupType, filteredSharing)
  const orderedVesselGroups = pinnedVesselGroups.concat(unpinnedVesselGroups)

  const updateGroupType = (nextGroupType: GroupType | undefined) => {
    dispatch(vesselGroupActions.setFilteredGroupType(nextGroupType))
    dispatch(renderVesselFeatures())
  }

  const updateSharing = (nextSharing: Sharing | undefined) => {
    dispatch(vesselGroupActions.setFilteredSharing(nextSharing))
    dispatch(renderVesselFeatures())
  }

  const createNewDynamicGroup = () => {
    dispatch(vesselGroupActions.vesselGroupEdited(DEFAULT_DYNAMIC_VESSEL_GROUP))
    dispatch(setDisplayedComponents({ isVesselGroupMainWindowEditionDisplayed: true }))
  }

  const createNewFixedGroup = () => {
    dispatch(vesselGroupActions.vesselGroupEdited(DEFAULT_FIXED_VESSEL_GROUP))
    dispatch(setDisplayedComponents({ isVesselGroupMainWindowEditionDisplayed: true }))
  }

  const toggleVesselGroupsMenu = () => {
    dispatch(setRightMapBoxDisplayed(rightMapBoxOpened === MapBox.VESSEL_GROUPS ? undefined : MapBox.VESSEL_GROUPS))
  }

  const toggleVesselGroupList = () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.VESSEL_GROUP }))
  }

  return (
    isRendered && (
      <VesselGroupMenuDialogWrapper $isOpen={isOpened} data-cy="vessel-groups-menu-box">
        <Header>
          <CloseButton Icon={Icon.Close} onClick={toggleVesselGroupsMenu} title="Fermer" />
          <Title>Groupes de navires</Title>
        </Header>
        <StyledBody>
          <FilterRow>
            <Select
              isLabelHidden
              isLight
              label="Type de groupe"
              name="groupType"
              onChange={value => updateGroupType(value as GroupType | undefined)}
              options={GROUP_TYPE_OPTIONS}
              placeholder="Groupes dynamiques et fixes"
              value={filteredGroupType}
            />
          </FilterRow>
          {isSuperUser && (
            <FilterRow>
              <Select
                isLabelHidden
                isLight
                label="Partage"
                name="sharing"
                onChange={value => updateSharing(value as Sharing | undefined)}
                options={SHARING_OPTIONS}
                placeholder="Groupes partagés et personnels"
                value={filteredSharing}
              />
            </FilterRow>
          )}
          <VesselGroupList data-cy="vessel-groups-list">
            {orderedVesselGroups.map((vesselGroup: VesselGroup, index: number) => (
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
                onClick={createNewFixedGroup}
                title="Un groupe de navires fixe est constitué des navires sélectionnés manuellement, soit directement dans la liste, soit en chargeant un fichier. Vous pouvez le mettre à jour (suppression ou ajouts de navires) également de façon manuelle."
              >
                Créer un groupe fixe <Icon.Info size={17} />
              </StyledDropdownItem>
              <StyledDropdownItem
                onClick={createNewDynamicGroup}
                title="Un groupe de navires dynamique est constitué des navires répondant aux critères des filtres que vous aurez sélectionné. Il se met automatiquement à jour selon l'évolution des données des navires."
              >
                Créer un groupe dynamique <Icon.Info size={17} />
              </StyledDropdownItem>
            </StyledDropdown>
            <Button accent={Accent.SECONDARY} Icon={Icon.Expand} onClick={toggleVesselGroupList}>
              Voir la vue détaillée des groupes
            </Button>
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

const Title = styled(MapMenuDialog.Title)`
  text-align: center;
  width: 100%;
  margin-right: 37px;
`

const FilterRow = styled.div`
  padding: 0 16px 8px;

  .rs-picker-select {
    border: 1px solid ${p => p.theme.color.lightGray};
  }
`

const StyledDropdownItem = styled(Dropdown.Item)`
  padding: 9px 10px 9px 10px;

  .Element-IconBox {
    margin-left: 9px;
  }
`

const VesselGroupList = styled.ul`
  color: ${p => p.theme.color.gunMetal};
  margin-top: 8px;
  max-height: 48vh;
  overflow-x: hidden;
  padding: 0;
  transition: 0.5s all;
  border-top: ${p => `1px solid ${p.theme.color.lightGray}`};
`

const StyledFooter = styled(MapMenuDialog.Footer)`
  padding: 0;
  gap: 0;
`

const StyledBody = styled(MapMenuDialog.Body)`
  padding: 16px 0 0;
`

const VesselGroupMenuDialogWrapper = styled(MapToolBox)`
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

  button {
    width: 100%;
  }
`

const StyledDropdown = styled(Dropdown)`
  width: 100%;
  margin-bottom: 8px;

  .rs-dropdown-toggle.rs-btn {
    z-index: unset;
  }
`
