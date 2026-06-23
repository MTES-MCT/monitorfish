import { ConfirmationModal } from '@components/ConfirmationModal'
import { Bold } from '@components/style'
import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { addVesselToGroupFromDropdown } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/addVesselToGroupFromDropdown'
import { removeVesselFromGroup } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/removeVesselFromGroup'
import { type FixedVesselGroup, GroupType, Sharing } from '@features/VesselGroup/types'
import { isPriorityGroup } from '@features/VesselGroup/utils/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Dropdown, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
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
  const sortedGroups = [...(selectedVessel?.groups ?? [])].sort(
    (groupA, groupB) => Number(isPriorityGroup(groupB)) - Number(isPriorityGroup(groupA))
  )
  const vesselsGroupsAsOptions = vesselGroups
    ?.filter(group => group.type === GroupType.FIXED && !currentVesselGroupIds.includes(group.id))
    ?.map(group => ({
      label: group.name,
      value: group as FixedVesselGroup
    }))

  return (
    <Wrapper>
      <Header>Groupes du navire</Header>
      {sortedGroups.map(group => (
        <Row key={group.id}>
          {isPriorityGroup(group) ? (
            <PriorityIcon data-cy="vessel-group-priority-icon">
              <Icon.Priority color={group.color} size={16} />
            </PriorityIcon>
          ) : (
            <PriorityIcon>
              <Icon.CircleFilled color={group.color} size={16} />
            </PriorityIcon>
          )}
          <GroupName title={`${group.name} - ${group.description}`}>{group.name}</GroupName>
          {group.sharing === Sharing.SHARED && (
            <Icon.Sharing color={THEME.color.slateGray} size={20} title="Ce groupe est partagé" />
          )}
          <CloseButton
            $isLast={group.sharing !== Sharing.SHARED}
            accent={Accent.TERTIARY}
            data-cy="vessel-sidebar-delete-vessel-from-group"
            disabled={group.type === GroupType.DYNAMIC || group.type === GroupType.HARDCODED}
            Icon={Icon.Close}
            iconSize={16}
            onClick={() => setIsDeleteConfirmationModalOpenForGroup(group as FixedVesselGroup)}
            title={(() => {
              if (group.type === GroupType.DYNAMIC) {
                return "Le navire ne peut pas être retiré d'un groupe dynamique"
              }

              if (group.type === GroupType.HARDCODED) {
                return "Le navire ne peut pas être retiré d'un groupe de cibles prioritaires"
              }

              return 'Supprimer le navire du groupe fixe'
            })()}
          />
        </Row>
      ))}

      {!selectedVessel?.groups?.length && <EmptyGroups>Aucun groupe</EmptyGroups>}
      <DropdownWrapper>
        <StyledDropdown
          disabled={!vesselsGroupsAsOptions?.length}
          Icon={Icon.Plus}
          placement="topStart"
          title={
            vesselsGroupsAsOptions?.length
              ? 'Ajouter le navire à un groupe fixe'
              : "Vous n'avez pas encore de groupe fixe auquel ajouter le navire"
          }
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
            <>
              <p>Êtes-vous sûr de vouloir supprimer le navire de ce groupe ? </p>
              {isDeleteConfirmationModalOpenForGroup?.sharing === Sharing.SHARED && (
                <StyledBold>
                  Attention, il sera également supprimé du groupe pour les autres utilisateurs avec lesquels ce dernier
                  est partagé.
                </StyledBold>
              )}
            </>
          }
          onCancel={() => setIsDeleteConfirmationModalOpenForGroup(undefined)}
          onConfirm={() => dispatch(removeVesselFromGroup(isDeleteConfirmationModalOpenForGroup))}
          title="Supprimer le navire du groupe"
        />
      )}
    </Wrapper>
  )
}

const StyledBold = styled(Bold)`
  color: ${p => p.theme.color.maximumRed};
`

const DropdownWrapper = styled.div`
  margin: 16px 24px;

  button {
    width: 100%;
  }
`

const StyledDropdown = styled(Dropdown)`
  width: 100%;

  button {
    z-index: unset !important;
  }
`

const EmptyGroups = styled.div`
  text-align: center;
  padding: 7px 24px;
  color: ${p => p.theme.color.slateGray};
`

const CloseButton = styled(IconButton)<{
  $isLast: boolean
}>`
  margin-left: ${p => (p.$isLast ? 'auto' : '8px')};
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

  .Element-IconBox {
    margin-left: auto;
    margin-right: 0;
    padding-right: 0;
  }
`

const PriorityIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  flex-shrink: 0;
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
