import { Body } from '@features/SideWindow/components/Body'
import { SEARCH_QUERY_MIN_LENGTH } from '@features/VesselGroup/components/VesselGroupList/hooks/constants'
import { useGetVesselGroupsWithVessels } from '@features/VesselGroup/components/VesselGroupList/hooks/useGetVesselGroupsWithVessels'
import { vesselGroupListActions } from '@features/VesselGroup/components/VesselGroupList/slice'
import { VesselGroupRow } from '@features/VesselGroup/components/VesselGroupList/VesselGroupRow'
import { GroupType, Sharing } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector.ts'
import { trackEvent } from '@hooks/useTracking'
import { Checkbox, FulfillingBouncingCircleLoader, Size, TextInput, THEME } from '@mtes-mct/monitor-ui'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { UserAccountContext } from '../../../../context/UserAccountContext'

type VesselListProps = Readonly<{
  isFromUrl: boolean
}>
export function VesselGroupList({ isFromUrl }: VesselListProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const searchQuery = useMainAppSelector(state => state.vesselGroupList.searchQuery)
  const userAccount = useContext(UserAccountContext)
  const [filteredGroupTypes, setFilteredGroupTypes] = useState<GroupType[]>([GroupType.DYNAMIC, GroupType.FIXED])
  const [filteredSharing, setFilteredSharing] = useState<Sharing[]>([Sharing.SHARED, Sharing.PRIVATE])
  const [filteredExpired, setFilterExpired] = useState<boolean>(false)

  useEffect(() => {
    trackEvent({
      action: 'Affichage des groupes de navires depuis la deuxième fenêtre',
      category: 'VESSEL_GROUP',
      name: userAccount?.email ?? ''
    })
  }, [userAccount?.email])

  const { isLoading, pinnedVesselGroupsWithVessels, unpinnedVesselGroupsWithVessels } = useGetVesselGroupsWithVessels(
    filteredGroupTypes,
    filteredSharing,
    filteredExpired
  )

  const toggleSetSearchQuery = (nextQuery: string | undefined) => {
    dispatch(vesselGroupListActions.setSearchQuery(nextQuery))
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

  const updateExpiredGroups = (nextExpired: boolean | undefined) => {
    setFilterExpired(!!nextExpired)
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
          {isSuperUser && (
            <>
              <VerticalBar />
              <StyledCheckbox
                checked={filteredSharing.includes(Sharing.PRIVATE)}
                label="Groupes personnels"
                name="private"
                onChange={updatePrivateSharing}
                title="Groupes personnels"
              />
              <StyledCheckbox
                checked={filteredSharing.includes(Sharing.SHARED)}
                label="Groupes partagés"
                name="shared"
                onChange={updateSharedSharing}
                title="Groupes partagés"
              />
            </>
          )}
          <>
            <VerticalBar />
            <StyledCheckbox
              checked={filteredExpired}
              label="Groupes expirés"
              name="expired"
              onChange={updateExpiredGroups}
              title="Groupes expirés"
            />
          </>
        </Row>
        {!isLoading && pinnedVesselGroupsWithVessels.length > 0 && (
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
        {!isLoading && unpinnedVesselGroupsWithVessels.length > 0 && (
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
        {isLoading && <StyledLoader color={THEME.color.slateGray} size={40} />}
        {pinnedVesselGroupsWithVessels.length + unpinnedVesselGroupsWithVessels.length === 0 && !isLoading && (
          <NoGroup>Aucun groupe.</NoGroup>
        )}
      </StyledBody>
    </>
  )
}

const StyledLoader = styled(FulfillingBouncingCircleLoader)`
  margin: auto;
`

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

const VerticalBar = styled.span`
  background: ${p => p.theme.color.lightGray};
  height: 20px;
  width: 2px;
  margin-bottom: 16px;
  margin-left: 16px;
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
