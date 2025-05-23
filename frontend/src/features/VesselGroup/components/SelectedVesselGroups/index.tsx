import { Square } from '@features/Regulation/components/ZonePreview'
import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { addOrRemoveVesselToGroupFromCheckPicker } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/addOrRemoveVesselToGroupFromCheckPicker'
import { removeVesselFromGroup } from '@features/VesselGroup/components/SelectedVesselGroups/useCases/removeVesselFromGroup'
import { type FixedVesselGroup, GroupType } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, CheckPicker, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function SelectedVesselGroups() {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { data: vesselGroups } = useGetAllVesselGroupsQuery()

  const vesselsGroupsAsOptions = vesselGroups
    ?.filter(group => group.type === GroupType.FIXED)
    ?.map(group => ({
      label: group.name,
      value: group.id
    }))
  const currentVesselGroupIds = selectedVessel?.groups?.map(group => group.id)

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
      <StyledCheckPicker
        cleanable={false}
        isLabelHidden
        isTransparent
        label="Ajouter le navire à un groupe fixe"
        name="vesselGroups"
        onChange={nextGroups => dispatch(addOrRemoveVesselToGroupFromCheckPicker(currentVesselGroupIds, nextGroups))}
        options={vesselsGroupsAsOptions}
        placeholder="Ajouter le navire à un groupe fixe"
        placement="topStart"
        renderValue={() => <>Ajouter le navire à un groupe fixe</>}
        searchable
        value={currentVesselGroupIds}
      />
    </Wrapper>
  )
}

const StyledCheckPicker = styled(CheckPicker)`
  margin: 16px 24px;
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
