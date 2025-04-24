import { Body } from '@features/SideWindow/components/Body'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupList/VesselGroupRow'
import { useGetVesselGroupsWithVessels } from '@features/VesselGroup/hooks/useGetVesselGroupsWithVessels'
import { Size, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

type VesselListProps = Readonly<{
  isFromUrl: boolean
}>
export function VesselGroupList({ isFromUrl }: VesselListProps) {
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const { pinnedVesselGroupsWithVessels, unpinnedVesselGroupsWithVessels } = useGetVesselGroupsWithVessels(searchQuery)
  const areGroupsOpened = !!searchQuery && searchQuery.length > 1

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
            onChange={nextValue => setSearchQuery(nextValue)}
            placeholder="Rechercher un navire"
            size={Size.LARGE}
            value={searchQuery}
          />
        </Row>
        <PinnedGroupsWrapper>
          <PinnedGroupsTitle>Groupes épinglés</PinnedGroupsTitle>
          {pinnedVesselGroupsWithVessels.length === 0 && <NoGroup>Aucun groupe épinglé.</NoGroup>}
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
      </StyledBody>
    </>
  )
}

const NoGroup = styled.div`
  color: ${p => p.theme.color.slateGray};
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
