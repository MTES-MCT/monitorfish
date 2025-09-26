import { MapPropertyTrigger } from '@features/commonComponents/MapPropertyTrigger'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapBox } from '@features/Map/constants'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useGetVesselGroups } from '@features/VesselGroup/components/VesselGroupMenuDialog/hooks/useGetVesselGroups'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupMenuDialog/VesselGroupRow'
import { DEFAULT_DYNAMIC_VESSEL_GROUP, DEFAULT_FIXED_VESSEL_GROUP } from '@features/VesselGroup/constants'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import { GroupType, Sharing, type VesselGroup } from '@features/VesselGroup/types'
import { hideVesselsNotInVesselGroups } from '@features/VesselGroup/useCases/hideVesselsNotInVesselGroups'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Checkbox, Dropdown, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../../domain/use_cases/setRightMapBoxDisplayed'

const MARGIN_TOP = 124

export function VesselGroupMenuDialog() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const areVesselGroupsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselGroupsDisplayed)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_GROUPS)

  const [filteredGroupTypes, setFilteredGroupTypes] = useState<GroupType[]>([GroupType.DYNAMIC, GroupType.FIXED])
  const [filteredSharing, setFilteredSharing] = useState<Sharing[]>([Sharing.SHARED, Sharing.PRIVATE])

  const { pinnedVesselGroups, unpinnedVesselGroups } = useGetVesselGroups(filteredGroupTypes, filteredSharing)
  const orderedVesselGroups = pinnedVesselGroups.concat(unpinnedVesselGroups)

  const updateDynamicGroupType = (nextGroupType: boolean | undefined) => {
    if (!nextGroupType) {
      setFilteredGroupTypes(filteredGroupTypes.filter(value => value !== GroupType.DYNAMIC))

      return
    }

    setFilteredGroupTypes(filteredGroupTypes.concat(GroupType.DYNAMIC))
  }

  const updateFixedGroupType = (nextGroupType: boolean | undefined) => {
    if (!nextGroupType) {
      setFilteredGroupTypes(filteredGroupTypes.filter(value => value !== GroupType.FIXED))

      return
    }

    setFilteredGroupTypes(filteredGroupTypes.concat(GroupType.FIXED))
  }

  const updatePrivateSharing = (nextSharing: boolean | undefined) => {
    if (!nextSharing) {
      setFilteredSharing(filteredSharing.filter(value => value !== Sharing.PRIVATE))

      return
    }

    setFilteredSharing(filteredSharing.concat(Sharing.PRIVATE))
  }

  const updateSharedSharing = (nextSharing: boolean | undefined) => {
    if (!nextSharing) {
      setFilteredSharing(filteredSharing.filter(value => value !== Sharing.SHARED))

      return
    }

    setFilteredSharing(filteredSharing.concat(Sharing.SHARED))
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

  const toggleVesselGroupsDisplay = () => {
    dispatch(setDisplayedComponents({ areVesselGroupsDisplayed: !areVesselGroupsDisplayed }))
  }

  const toggleVesselGroupList = () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.VESSEL_GROUP }))
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
          <Columns>
            <FirstColumnCheckbox
              checked={filteredGroupTypes.includes(GroupType.FIXED)}
              label="Groupes fixes"
              name="fixed"
              onChange={updateFixedGroupType}
              title="Groupes fixes"
            />
            <SecondColumnCheckbox
              checked={filteredGroupTypes.includes(GroupType.DYNAMIC)}
              label="Groupes dynamiques"
              name="dynamics"
              onChange={updateDynamicGroupType}
              title="Groupes dynamiques"
            />
          </Columns>
          {isSuperUser && (
            <Columns>
              <FirstColumnCheckbox
                checked={filteredSharing.includes(Sharing.PRIVATE)}
                label="Groupes personnels"
                name="private"
                onChange={updatePrivateSharing}
                title="Groupes personnels"
              />
              <SecondColumnCheckbox
                checked={filteredSharing.includes(Sharing.SHARED)}
                label="Groupes partagés"
                name="shared"
                onChange={updateSharedSharing}
                title="Groupes partagés"
              />
            </Columns>
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

const Columns = styled.div`
  display: flex;
`

const FirstColumnCheckbox = styled(Checkbox)`
  margin-left: 16px;
  height: 34px;
  width: 160px;
  flex-shrink: 0;

  label {
    vertical-align: middle;
  }
`

const SecondColumnCheckbox = styled(Checkbox)`
  margin-left: 16px;
  height: 34px;
  flex-shrink: 0;

  label {
    vertical-align: middle;
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
  margin: 0;
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

  button {
    width: 100%;
  }
`

const StyledDropdown = styled(Dropdown)`
  width: 100%;
  margin-bottom: 8px;
`
