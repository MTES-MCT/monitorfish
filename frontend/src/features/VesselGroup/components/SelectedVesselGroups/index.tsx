import { Square } from '@features/Regulation/components/ZonePreview'
import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { addVesselToGroupFromDropdown } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/addVesselToGroupFromDropdown'
import { removeVesselFromGroup } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/removeVesselFromGroup'
import { type FixedVesselGroup, GroupType } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Dropdown, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function SelectedVesselGroups() {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { data: vesselGroups } = useGetAllVesselGroupsQuery()

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
          <CloseButton
            accent={Accent.TERTIARY}
            data-cy="vessel-sidebar-delete-vessel-from-group"
            disabled={group.type === GroupType.DYNAMIC}
            Icon={Icon.Close}
            iconSize={16}
            onClick={() => dispatch(removeVesselFromGroup(group as FixedVesselGroup))}
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
            <Dropdown.Item onClick={() => dispatch(addVesselToGroupFromDropdown(group.value))}>
              {group.label}
            </Dropdown.Item>
          ))}
        </StyledDropdown>
      </DropdownWrapper>
    </Wrapper>
  )
}

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

const CloseButton = styled(IconButton)`
  margin-left: auto;
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
