import { ConfirmationModal } from '@components/ConfirmationModal'
import { Square } from '@features/Regulation/components/ZonePreview'
import { VesselSearchWithMapVessels } from '@features/Vessel/components/VesselSearch/VesselSearchWithMapVessels'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { EditDynamicVesselGroupDialog } from '@features/VesselGroup/components/EditDynamicVesselGroupDialog'
import { EditFixedVesselGroupDialog } from '@features/VesselGroup/components/EditFixedVesselGroupDialog'
import { VesselTable } from '@features/VesselGroup/components/VesselGroupList/VesselTable'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import {
  type DynamicVesselGroup,
  type FixedVesselGroup,
  GroupType,
  Sharing,
  type VesselGroupWithVessels
} from '@features/VesselGroup/types'
import { addVesselToFixedVesselGroup } from '@features/VesselGroup/useCases/addVesselToFixedVesselGroup'
import { deleteVesselGroup } from '@features/VesselGroup/useCases/deleteVesselGroup'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Icon, IconButton, Tag, THEME, useNewWindow } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { getDate } from '../../../../utils'

import type { Vessel } from '@features/Vessel/Vessel.types'

type VesselGroupRowProps = {
  isFromUrl: boolean
  isOpened: boolean
  isPinned: boolean
  vesselGroupWithVessels: VesselGroupWithVessels
}
export function VesselGroupRow({ isFromUrl, isOpened, isPinned, vesselGroupWithVessels }: VesselGroupRowProps) {
  const { newWindowContainerRef } = useNewWindow()
  const dispatch = useMainAppDispatch()

  const [isOpen, setIsOpen] = useState<boolean>(isOpened)
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState<boolean>(false)
  const [isEditDynamicVesselGroupOpened, setIsEditDynamicVesselGroupOpened] = useState(false)
  const [isEditFixedVesselGroupOpened, setIsEditFixedVesselGroupOpened] = useState(false)

  const handleDeleteVesselGroup = () => {
    dispatch(deleteVesselGroup(vesselGroupWithVessels.group.id))
    setIsDeleteConfirmationModalOpen(false)
  }

  const handleEditVesselGroup = () => {
    switch (vesselGroupWithVessels.group.type) {
      case GroupType.FIXED:
        setIsEditFixedVesselGroupOpened(true)
        break
      case GroupType.DYNAMIC:
        setIsEditDynamicVesselGroupOpened(true)
        break
      default:
        break
    }
  }

  useEffect(() => {
    setIsOpen(isOpened)
  }, [isOpened])

  const togglePinGroup = async event => {
    event.stopPropagation()

    if (isPinned) {
      await dispatch(vesselGroupActions.vesselGroupIdUnpinned(vesselGroupWithVessels.group.id))
    } else {
      await dispatch(vesselGroupActions.vesselGroupIdPinned(vesselGroupWithVessels.group.id))
    }

    dispatch(renderVesselFeatures())
  }

  const addVessel = (nextVessel: Vessel.VesselIdentity | undefined) => {
    dispatch(addVesselToFixedVesselGroup(nextVessel, vesselGroupWithVessels.group as FixedVesselGroup))
  }

  return (
    <>
      <Wrapper title={vesselGroupWithVessels.group.name}>
        <Row onClick={() => setIsOpen(!isOpen)}>
          <IconButton
            accent={Accent.TERTIARY}
            aria-label="Sélectionner"
            color={isPinned ? THEME.color.blueGray : THEME.color.gunMetal}
            Icon={Icon.Pin}
            onClick={togglePinGroup}
            style={{ marginRight: 4 }}
            title={`${isPinned ? 'Dépingler' : 'Epingler'} le groupe "${vesselGroupWithVessels.group.name}"`}
          />
          <StyledSquare $fillColor={vesselGroupWithVessels.group.color} $strokeColor={THEME.color.lightGray} />
          {vesselGroupWithVessels.group.name}
          <ChevronIcon $isOpen={isOpen} color={THEME.color.slateGray} />
          {vesselGroupWithVessels.group.type === GroupType.DYNAMIC && (
            <StyledTag borderColor={THEME.color.slateGray}>Groupe dynamique</StyledTag>
          )}
          {vesselGroupWithVessels.group.type === GroupType.FIXED && (
            <StyledTag borderColor={THEME.color.slateGray}>Groupe fixe</StyledTag>
          )}
          {vesselGroupWithVessels.group.sharing === Sharing.PRIVATE && (
            <StyledTag backgroundColor={THEME.color.goldenPoppy25} borderColor={THEME.color.goldenPoppyBorder}>
              Groupe privé
            </StyledTag>
          )}
          {vesselGroupWithVessels.group.sharing === Sharing.SHARED && (
            <StyledTag backgroundColor={THEME.color.goldenPoppy25} borderColor={THEME.color.goldenPoppyBorder}>
              Groupe partagé
            </StyledTag>
          )}
          <RowIcons>
            <span>
              <b>{vesselGroupWithVessels.vessels.length} navires</b> – Créé le{' '}
              {getDate(vesselGroupWithVessels.group.createdAtUtc)}
              {vesselGroupWithVessels.group.updatedAtUtc &&
                `, modifié le ${getDate(vesselGroupWithVessels.group.updatedAtUtc)}`}
            </span>
            <Separator />
            <IconButton
              accent={Accent.TERTIARY}
              Icon={Icon.Delete}
              iconSize={20}
              onClick={event => {
                event.stopPropagation()
                setIsDeleteConfirmationModalOpen(true)
              }}
              title={`Supprimer le groupe "${vesselGroupWithVessels.group.name}"`}
            />
            <IconButton
              accent={Accent.TERTIARY}
              Icon={Icon.Edit}
              iconSize={20}
              onClick={event => {
                event.stopPropagation()
                handleEditVesselGroup()
              }}
              title={`Modifier le groupe "${vesselGroupWithVessels.group.name}"`}
            />
          </RowIcons>
        </Row>
        {isOpen && (
          <OpenedGroup>
            <Description title={vesselGroupWithVessels.group.description}>
              {vesselGroupWithVessels.group.description}
            </Description>
            <PointsOfAttention title={vesselGroupWithVessels.group.pointsOfAttention}>
              {vesselGroupWithVessels.group.pointsOfAttention}
            </PointsOfAttention>
            <VesselTable
              isFixedGroup={vesselGroupWithVessels.group.type === GroupType.FIXED}
              isFromUrl={isFromUrl}
              isPinned={isPinned}
              vesselGroupId={vesselGroupWithVessels.group.id}
              vessels={vesselGroupWithVessels.vessels}
            />
            {vesselGroupWithVessels.group.type === GroupType.FIXED && (
              <StyledVesselSearch
                baseRef={newWindowContainerRef}
                displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_VESSEL_GROUP_LIST_ERROR}
                onChange={addVessel}
                placeholder="Rechercher un navire pour l'ajouter au groupe"
                shouldCloseOnClickOutside
                shouldResetSelectedVesselOnChange
                value={undefined}
              />
            )}
          </OpenedGroup>
        )}
      </Wrapper>
      {isDeleteConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <p>
              <b>Êtes-vous sûr de vouloir supprimer ce groupe de navires ?</b>
            </p>
          }
          onCancel={() => setIsDeleteConfirmationModalOpen(false)}
          onConfirm={handleDeleteVesselGroup}
          title="Supprimer un groupe"
        />
      )}
      {isEditDynamicVesselGroupOpened && (
        <EditDynamicVesselGroupDialog
          editedVesselGroup={vesselGroupWithVessels.group}
          initialListFilterValues={(vesselGroupWithVessels.group as DynamicVesselGroup).filters}
          onExit={() => setIsEditDynamicVesselGroupOpened(false)}
        />
      )}
      {isEditFixedVesselGroupOpened && (
        <EditFixedVesselGroupDialog
          editedVesselGroup={vesselGroupWithVessels.group}
          onExit={() => setIsEditFixedVesselGroupOpened(false)}
        />
      )}
    </>
  )
}

const StyledVesselSearch = styled(VesselSearchWithMapVessels)`
  margin-top: 16px;
  border: solid 1px ${p => p.theme.color.lightGray};
  width: 480px;

  > div:nth-child(2) {
    border: solid 1px ${p => p.theme.color.lightGray};
    width: 480px;
  }
`

const StyledSquare = styled(Square)`
  margin-top: 4px;
`

const StyledTag = styled(Tag)`
  margin-right: 8px;
  font-weight: normal;
`

const Description = styled.p``

const PointsOfAttention = styled.p`
  color: ${THEME.color.maximumRed};
`

const OpenedGroup = styled.div`
  margin: 16px 16px 16px 0;
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  align-items: flex-start;
  display: flex;
  height: 23px;
  font-size: 16px;
  padding: 8px 0 8px 0;
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const Separator = styled.span`
  background: ${p => p.theme.color.lightGray};
  height: 20px;
  width: 1px;
`

const RowIcons = styled.div`
  margin-left: auto;
  margin-right: 0;
  flex-shrink: 0;
  display: flex;
  gap: 16px;
  height: 36px;
  align-items: center;
  cursor: pointer;

  > span {
    color: ${p => p.theme.color.slateGray};
    font-weight: normal;
  }

  > span > b {
    font-weight: 500;
  }

  .Element-IconButton {
    padding-right: 0;
  }
`

const ChevronIcon = styled(Icon.Chevron)<{
  $isOpen: boolean
}>`
  margin-left: 8px;
  margin-right: 16px;
  transform: rotate(${p => (p.$isOpen ? 180 : 0)}deg);
  transition: all 0.2s ease;
`

const Wrapper = styled.li`
  list-style-type: none;
  margin-bottom: 36px;
`
