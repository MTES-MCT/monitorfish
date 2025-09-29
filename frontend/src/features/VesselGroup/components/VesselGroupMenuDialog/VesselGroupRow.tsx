import { ConfirmationModal } from '@components/ConfirmationModal'
import { Square } from '@features/Regulation/components/ZonePreview'
import { FilterTags } from '@features/Vessel/components/VesselList/FilterTags'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { CNSP_SERVICE_LABEL } from '@features/VesselGroup/constants'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import { GroupType, Sharing, type VesselGroup } from '@features/VesselGroup/types'
import { deleteVesselGroup } from '@features/VesselGroup/useCases/deleteVesselGroup'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { Accent, customDayjs, Icon, IconButton, Link, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useContext, useState } from 'react'
import styled from 'styled-components'

import { UserAccountContext } from '../../../../context/UserAccountContext'
import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'

type VesselGroupRowProps = {
  isLastPinned: boolean
  vesselGroup: VesselGroup
}
export function VesselGroupRow({ isLastPinned, vesselGroup }: VesselGroupRowProps) {
  const dispatch = useMainAppDispatch()
  const userAccount = useContext(UserAccountContext)
  const vesselGroupsIdsDisplayed = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsDisplayed)
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)
  const isDisplayed = vesselGroupsIdsDisplayed.includes(vesselGroup.id)

  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isGroupFilterCriteriaOpen, setIsGroupFilterCriteriaOpen] = useState<boolean>(false)
  const isPinned = vesselGroupsIdsPinned.includes(vesselGroup.id)

  const handleDeleteVesselGroup = () => {
    dispatch(deleteVesselGroup(vesselGroup.id))
    setIsDeleteConfirmationModalOpen(false)
  }

  const handleEditVesselGroup = () => {
    dispatch(vesselGroupActions.vesselGroupEdited(vesselGroup))
    dispatch(setDisplayedComponents({ isVesselGroupMainWindowEditionDisplayed: true }))
  }

  const togglePinGroup = async event => {
    event.stopPropagation()

    if (isPinned) {
      await dispatch(vesselGroupActions.vesselGroupIdUnpinned(vesselGroup.id))
    } else {
      await dispatch(vesselGroupActions.vesselGroupIdPinned(vesselGroup.id))
    }

    dispatch(renderVesselFeatures())
  }

  const hideGroup = async event => {
    event.stopPropagation()
    trackEvent({
      action: "Masquage d' un groupe de navires depuis la cartographie",
      category: 'VESSEL_GROUP',
      name: userAccount?.email ?? ''
    })
    await dispatch(vesselGroupActions.vesselGroupIdHidden(vesselGroup.id))
    dispatch(renderVesselFeatures())
  }

  const showGroup = async event => {
    event.stopPropagation()
    trackEvent({
      action: "Affichage d' un groupe de navires depuis la cartographie",
      category: 'VESSEL_GROUP',
      name: userAccount?.email ?? ''
    })
    await dispatch(vesselGroupActions.vesselGroupIdDisplayed(vesselGroup.id))
    dispatch(renderVesselFeatures())
  }

  const description =
    (vesselGroup.description ?? '').length > 140
      ? `${vesselGroup.description?.substring(0, 140)}...`
      : vesselGroup.description

  const isInFuture = vesselGroup.startOfValidityUtc
    ? customDayjs(vesselGroup.startOfValidityUtc).isAfter(customDayjs(), 'day')
    : false

  return (
    <>
      <Wrapper $isLastPinned={isLastPinned} $isPinned={isPinned} title={vesselGroup?.name}>
        <Row onClick={() => setIsOpen(!isOpen)}>
          <ChevronIcon $isOpen={isOpen} color={THEME.color.slateGray} />
          <Square $fillColor={vesselGroup.color} $strokeColor={THEME.color.lightGray} />
          <GroupTitle>{vesselGroup.name}</GroupTitle>
          <ValidityText>{isInFuture ? ' – À venir' : ''}</ValidityText>
          <RowIcons>
            <IconButton
              accent={Accent.TERTIARY}
              aria-label="Sélectionner"
              color={isPinned ? THEME.color.blueGray : THEME.color.gunMetal}
              Icon={Icon.Pin}
              onClick={togglePinGroup}
              title={`${isPinned ? 'Dépingler' : 'Epingler'} le groupe "${vesselGroup.name}"`}
            />
            {isDisplayed ? (
              <IconButton
                accent={Accent.TERTIARY}
                Icon={Icon.Display}
                iconSize={20}
                onClick={hideGroup}
                title={`Cacher le groupe "${vesselGroup.name}"`}
              />
            ) : (
              <IconButton
                accent={Accent.TERTIARY}
                color={THEME.color.lightGray}
                Icon={Icon.Hide}
                iconSize={20}
                onClick={showGroup}
                title={`Afficher le groupe "${vesselGroup.name}"`}
              />
            )}
          </RowIcons>
        </Row>
        {isOpen && (
          <OpenedGroup>
            <GroupInformation>
              <Description title={vesselGroup.description}>{description}</Description>
              {vesselGroup.type === GroupType.DYNAMIC && (
                <StyledTag borderColor={THEME.color.slateGray}>Groupe dynamique</StyledTag>
              )}
              {vesselGroup.type === GroupType.FIXED && (
                <StyledTag borderColor={THEME.color.slateGray}>Groupe fixe</StyledTag>
              )}
              {vesselGroup.sharing === Sharing.PRIVATE && (
                <StyledTag backgroundColor={THEME.color.gainsboro} borderColor={THEME.color.lightGray}>
                  Groupe personnel
                </StyledTag>
              )}
              {vesselGroup.sharing === Sharing.SHARED && (
                <StyledTag
                  backgroundColor={THEME.color.goldenPoppy25}
                  borderColor={THEME.color.goldenPoppyBorder}
                  title={vesselGroup.sharedTo?.map(shared => CNSP_SERVICE_LABEL[shared])?.join(', ')}
                >
                  Groupe partagé
                </StyledTag>
              )}
              {vesselGroup.type === GroupType.DYNAMIC && (
                <>
                  {isGroupFilterCriteriaOpen && <StyledFilterTags isReadOnly listFilterValues={vesselGroup?.filters} />}
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <StyledLink
                    $isOpen={isGroupFilterCriteriaOpen}
                    onClick={() => setIsGroupFilterCriteriaOpen(!isGroupFilterCriteriaOpen)}
                    title={`${isGroupFilterCriteriaOpen ? 'Masquer' : 'Afficher'} les critères de définition du groupe`}
                  >
                    {isGroupFilterCriteriaOpen ? 'Masquer' : 'Afficher'} les critères de définition du groupe
                  </StyledLink>
                </>
              )}
            </GroupInformation>
            <OpenedGroupIcons>
              <IconButton
                accent={Accent.TERTIARY}
                Icon={Icon.Edit}
                iconSize={20}
                onClick={handleEditVesselGroup}
                title={`Modifier le groupe "${vesselGroup.name}"`}
              />
              <IconButton
                accent={Accent.TERTIARY}
                Icon={Icon.Delete}
                iconSize={20}
                onClick={() => setIsDeleteConfirmationModalOpen(true)}
                title={`Supprimer le groupe "${vesselGroup.name}"`}
              />
            </OpenedGroupIcons>
          </OpenedGroup>
        )}
      </Wrapper>
      {isDeleteConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <ConfirmDeletionBody>
              <b>Êtes-vous sûr de vouloir supprimer ce groupe de navires ?</b>
              {vesselGroup.sharing === Sharing.SHARED && (
                <span>
                  Attention, il sera également supprimé pour les autres utilisateurs avec lesquels il est partagé.
                </span>
              )}
            </ConfirmDeletionBody>
          }
          onCancel={() => setIsDeleteConfirmationModalOpen(false)}
          onConfirm={handleDeleteVesselGroup}
          title="Supprimer un groupe"
        />
      )}
    </>
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

const StyledLink = styled(Link)<{
  $isOpen: boolean
}>`
  cursor: pointer;
  display: inline-block;
  margin-top: ${p => (p.$isOpen ? 8 : 16)}px;
`

const StyledFilterTags = styled(FilterTags)`
  margin-top: 16px;
`

const StyledTag = styled(Tag)`
  margin-right: 8px;
`

const Description = styled.p`
  margin-bottom: 8px;
`

const GroupInformation = styled.div`
  margin-right: 4px;
`
const OpenedGroupIcons = styled.div`
  width: 23px;
  margin-left: auto;

  .Element-IconButton {
    padding-right: 0;
  }

  .Element-IconButton:not(:first-child) {
    margin-top: 4px;
  }
`

const OpenedGroup = styled.div`
  margin: 0 16px 16px 36px;
  display: flex;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  height: 23px;
  padding: 8px 16px 8px 8px;
  user-select: none;
  font-weight: 700;
  cursor: pointer;
`

const GroupTitle = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`
const ValidityText = styled.span`
  color: #FF3392;
  display: flex;
  font-style: italic;
  font-weight: 400;
  white-space: nowrap;
`

const RowIcons = styled.div`
  margin-left: auto;
  margin-right: 0;
  flex-shrink: 0;
  display: flex;
  gap: 6px;
  height: 36px;
  align-items: center;
  cursor: pointer;

  .Element-IconButton {
    padding-right: 0;
  }
`

const ChevronIcon = styled(Icon.Chevron)<{
  $isOpen: boolean
}>`
  margin-right: 8px;
  transform: rotate(${p => (p.$isOpen ? 180 : 0)}deg);
  transition: all 0.2s ease;
`

const Wrapper = styled.li<{
  $isLastPinned: boolean
  $isPinned: boolean
}>`
  list-style-type: none;
  margin: 0;
  border-bottom: ${p => (p.$isLastPinned ? 2 : 1)}px solid ${p => p.theme.color.lightGray};
  background: ${p => (p.$isPinned ? p.theme.color.cultured : 'unset')};
`
