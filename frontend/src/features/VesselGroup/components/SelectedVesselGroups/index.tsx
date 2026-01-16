import { ConfirmationModal } from '@components/ConfirmationModal'
import { Square } from '@features/Regulation/components/ZonePreview'
import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { addVesselToGroupFromDropdown } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/addVesselToGroupFromDropdown'
import { removeVesselFromGroup } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/removeVesselFromGroup'
import { type FixedVesselGroup, GroupType, Sharing } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Dropdown, Icon, IconButton, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

export function SelectedVesselGroups() {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { data: vesselGroups } = useGetAllVesselGroupsQuery()
  const [isDeleteConfirmationModalOpenForGroup, setIsDeleteConfirmationModalOpenForGroup] = useState<
    FixedVesselGroup | undefined
  >(undefined)

  const currentVesselGroupIds = selectedVessel?.groups?.map(group => group.id) ?? []
  const vesselsGroupsAsOptions = vesselGroups
    ?.filter(group => group.type === GroupType.FIXED && !currentVesselGroupIds.includes(group.id))
    ?.map(group => ({
      label: group.name,
      value: group as FixedVesselGroup
    }))

  return (
    <Wrapper>
      <Header>Groupes du navire</Header>
      {selectedVessel?.groups.map(group => (
        <Row key={group.id}>
          <Square $fillColor={group.color} $strokeColor={THEME.color.lightGray} />
          <GroupName title={`${group.name} - ${group.description}`}>{group.name}</GroupName>
          {group.sharing === Sharing.SHARED && (
            <StyledAttentionIcon
              backgroundColor={THEME.color.goldenPoppy25}
              Icon={Icon.Attention}
              iconColor={THEME.color.gunMetal}
              title="Ce groupe est partagé"
              withCircleIcon
            />
          )}
          <CloseButton
            $isLast={group.sharing !== Sharing.SHARED}
            accent={Accent.TERTIARY}
            data-cy="vessel-sidebar-delete-vessel-from-group"
            disabled={group.type === GroupType.DYNAMIC}
            Icon={Icon.Close}
            iconSize={16}
            onClick={() => setIsDeleteConfirmationModalOpenForGroup(group as FixedVesselGroup)}
            title={
              group.type === GroupType.DYNAMIC
                ? "Le navire ne peut pas être retiré d'un groupe dynamique"
                : 'Supprimer le navire du groupe fixe'
            }
          />
        </Row>
      ))}

      {!selectedVessel?.groups?.length && <EmptyGroups>Aucun groupe</EmptyGroups>}
      <DropdownWrapper>
        <StyledDropdown
          disabled={!vesselsGroupsAsOptions?.length}
          Icon={Icon.Plus}
          placement="topStart"
          title="Ajouter le navire à un groupe fixe"
        >
          {vesselsGroupsAsOptions?.map(group => (
            <Dropdown.Item key={group.value.id} onClick={() => dispatch(addVesselToGroupFromDropdown(group.value))}>
              {group.label}
            </Dropdown.Item>
          ))}
        </StyledDropdown>
      </DropdownWrapper>
      {isDeleteConfirmationModalOpenForGroup && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <ConfirmDeletionBody>
              <b>Êtes-vous sûr de vouloir retirer le navire de ce groupe ? </b>
              {isDeleteConfirmationModalOpenForGroup?.sharing === Sharing.SHARED && (
                <span>
                  Attention, il sera également retiré du groupe pour les autres utilisateurs avec lesquels ce dernier
                  est partagé.
                </span>
              )}
            </ConfirmDeletionBody>
          }
          onCancel={() => setIsDeleteConfirmationModalOpenForGroup(undefined)}
          onConfirm={() => dispatch(removeVesselFromGroup(isDeleteConfirmationModalOpenForGroup))}
          title="Retirer le navire du groupe"
        />
      )}
    </Wrapper>
  )
}

const ConfirmDeletionBody = styled.p`
  span {
    margin-top: 24px;
    display: block;
    font-size: 16px;
    color: ${p => p.theme.color.maximumRed};
  }
`

const DropdownWrapper = styled.div`
  margin: 16px 24px;

  button {
    width: 100%;
  }
`

const StyledDropdown = styled(Dropdown)`
  width: 100%;
`

const EmptyGroups = styled.div`
  text-align: center;
  padding: 7px 24px;
  color: ${p => p.theme.color.slateGray};
`

const StyledAttentionIcon = styled(Tag)`
  padding: 0;
  border: 0;
  width: 20px;
  height: 20px;

  path {
    fill: ${p => p.theme.color.goldenPoppyBorder};
  }
`

const CloseButton = styled(IconButton)<{
  $isLast: boolean
}>`
  margin-left: ${p => (p.$isLast ? 'auto' : '10px')};
  margin-right: 0;
  padding-right: 0;
  height: 16px;
`

const Wrapper = styled.div`
  margin-top: 10px;
  background: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  padding: 7px 24px;
  font-weight: 500;
  align-items: center;
  display: flex;

  .Element-Tag {
    margin-left: auto;
    margin-right: 0;
    padding-right: 0;
  }
`

const GroupName = styled.span`
  overflow: hidden;
  max-width: 350px;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Header = styled.div`
  padding: 7px 24px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray};
`
