import { Body } from '@features/SideWindow/components/Body'
import { SEARCH_QUERY_MIN_LENGTH } from '@features/VesselGroup/components/VesselGroupList/hooks/constants'
import { useGetVesselGroupsWithVessels } from '@features/VesselGroup/components/VesselGroupList/hooks/useGetVesselGroupsWithVessels'
import { vesselGroupListActions } from '@features/VesselGroup/components/VesselGroupList/slice'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupList/VesselGroupRow'
import { GroupType } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Checkbox, Size, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

type VesselListProps = Readonly<{
  isFromUrl: boolean
}>
export function VesselGroupList({ isFromUrl }: VesselListProps) {
  const dispatch = useMainAppDispatch()
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [filteredGroupTypes, setFilteredGroupTypes] = useState<GroupType[]>([GroupType.DYNAMIC, GroupType.FIXED])

  const { pinnedVesselGroupsWithVessels, unpinnedVesselGroupsWithVessels } =
    useGetVesselGroupsWithVessels(filteredGroupTypes)

  const debouncedSetSearch = useDebouncedCallback(nextQuery => {
    dispatch(vesselGroupListActions.setSearchQuery(nextQuery))
  }, 250)

  const toggleSetSearchQuery = (nextQuery: string | undefined) => {
    setSearchQuery(nextQuery)
    debouncedSetSearch(nextQuery)
  }

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

  const areGroupsOpened = !!searchQuery && searchQuery.length > SEARCH_QUERY_MIN_LENGTH

  return (
    <>
      <StyledBody>
        <Row>
          <StyledTextInput
            isLabelHidden
            isSearchInput
            isTransparent
            label="Rechercher un navire"
            name="searchQuery"
            onChange={nextValue => toggleSetSearchQuery(nextValue)}
            placeholder="Rechercher un navire"
            size={Size.LARGE}
            value={searchQuery}
          />
          <StyledCheckbox
            checked={filteredGroupTypes.includes(GroupType.FIXED)}
            label="Groupes fixes"
            name="fixed"
            onChange={updateFixedGroupType}
            title="Groupes fixes"
          />
          <StyledCheckbox
            checked={filteredGroupTypes.includes(GroupType.DYNAMIC)}
            label="Groupes dynamiques"
            name="dynamics"
            onChange={updateDynamicGroupType}
            title="Groupes dynamiques"
          />
        </Row>
        {pinnedVesselGroupsWithVessels.length > 0 && (
          <PinnedGroupsWrapper>
            <PinnedGroupsTitle>Groupes épinglés</PinnedGroupsTitle>
            <PinnedGroups data-cy="pinned-vessels-groups">
              {pinnedVesselGroupsWithVessels.map(groupWithVessels => (
                <VesselGroupRow
                  key={groupWithVessels.group.id}
                  isFromUrl={isFromUrl}
                  isOpened={areGroupsOpened}
                  isPinned
                  vesselGroupWithVessels={groupWithVessels}
                />
              ))}
            </PinnedGroups>
          </PinnedGroupsWrapper>
        )}
        {unpinnedVesselGroupsWithVessels.length > 0 && (
          <UnpinnedGroups data-cy="unpinned-vessels-groups">
            {unpinnedVesselGroupsWithVessels.map(groupWithVessels => (
              <VesselGroupRow
                key={groupWithVessels.group.id}
                isFromUrl={isFromUrl}
                isOpened={areGroupsOpened}
                isPinned={false}
                vesselGroupWithVessels={groupWithVessels}
              />
            ))}
          </UnpinnedGroups>
        )}
        {pinnedVesselGroupsWithVessels.length + unpinnedVesselGroupsWithVessels.length === 0 && (
          <NoGroup>Aucun groupe.</NoGroup>
        )}
      </StyledBody>
    </>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-left: 16px;
  height: 35px;
`

const NoGroup = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-top: 16px;
  margin-left: 30px;
`

const StyledTextInput = styled(TextInput)`
  margin-bottom: 16px;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin-left: 30px;

  > .Field-TextInput {
    min-width: 280px;
  }
`

const StyledBody = styled(Body)`
  padding: 34px 0 0;
`

const PinnedGroups = styled.ul`
  padding: 0;
`

const UnpinnedGroups = styled.ul`
  padding: 32px 32px 16px 32px;
`

const PinnedGroupsWrapper = styled.div`
  padding: 16px 32px 16px 32px;
  border-bottom: 2px solid ${p => p.theme.color.gainsboro};
  border-top: 2px solid ${p => p.theme.color.gainsboro};
  background: ${p => p.theme.color.cultured};
`

const PinnedGroupsTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  display: inline-block;
  color: ${p => p.theme.color.slateGray};
`
